const Message = require('../models/Message');
const Match = require('../models/Match');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Find all accepted matches where current user is userA or userB
    const matches = await Match.find({
      $or: [{ userA: currentUserId }, { userB: currentUserId }],
      status: 'accepted',
    })
      .populate('userA', 'fullName avatar department semester')
      .populate('userB', 'fullName avatar department semester')
      .sort({ updatedAt: -1 });

    const conversations = [];

    for (const m of matches) {
      const isUserA = m.userA._id.toString() === currentUserId;
      const peer = isUserA ? m.userB : m.userA;

      const lastMsg = await Message.findOne({ matchId: m._id })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await Message.countDocuments({
        matchId: m._id,
        recipient: currentUserId,
        read: false,
      });

      let timeStr = 'New';
      if (lastMsg) {
        timeStr = new Date(lastMsg.createdAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });
      }

      conversations.push({
        id: m._id.toString(),
        peerId: peer._id.toString(),
        name: peer.fullName,
        avatar: peer.avatar || peer.fullName.charAt(0).toUpperCase(),
        department: peer.department || 'CSE',
        semester: peer.semester || '2.2',
        online: true,
        lastMessage: lastMsg ? lastMsg.text : 'Connected! Start your study exchange.',
        lastMessageTime: timeStr,
        unread: unreadCount,
      });
    }

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error('[getConversations Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversations.',
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match conversation not found.' });
    }

    if (match.userA.toString() !== currentUserId && match.userB.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation.' });
    }

    // Mark unread messages sent to me as read
    await Message.updateMany(
      { matchId, recipient: currentUserId, read: false },
      { read: true }
    );

    const rawMessages = await Message.find({ matchId }).sort({ createdAt: 1 });

    const messages = rawMessages.map((m) => {
      const isMe = m.sender.toString() === currentUserId;
      return {
        id: m._id.toString(),
        from: isMe ? 'me' : 'them',
        text: m.text,
        time: new Date(m.createdAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        createdAt: m.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('[getMessages Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages.',
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { matchId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match conversation not found.' });
    }

    if (match.userA.toString() !== currentUserId && match.userB.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to participate in this chat.' });
    }

    const recipientId = match.userA.toString() === currentUserId ? match.userB : match.userA;

    const message = new Message({
      matchId: match._id,
      sender: currentUserId,
      recipient: recipientId,
      text: text.trim(),
    });

    await message.save();

    // Update match timestamp
    match.updatedAt = new Date();
    await match.save();

    const formattedMessage = {
      id: message._id.toString(),
      from: 'me',
      text: message.text,
      time: new Date(message.createdAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
      createdAt: message.createdAt,
    };

    return res.status(201).json({
      success: true,
      message: formattedMessage,
    });
  } catch (error) {
    console.error('[sendMessage Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message.',
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
