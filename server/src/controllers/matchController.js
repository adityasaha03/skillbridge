const mongoose = require('mongoose');
const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const Tag = require('../models/Tag');

/**
 * Pure helper function to compute reciprocal matches
 * Cycles of length 2: (A teaches B) AND (B teaches A)
 */
const findReciprocalMatches = (currentUser, candidateUsers) => {
  const userWeakSet = new Set((currentUser.weakTags || []).map((t) => (t._id || t).toString()));
  const userStrongSet = new Set((currentUser.strongTags || []).map((t) => (t._id || t).toString()));

  if (userWeakSet.size === 0 || userStrongSet.size === 0) {
    return [];
  }

  const matches = [];

  for (const peer of candidateUsers) {
    if (peer._id.toString() === currentUser._id.toString()) continue;

    const peerStrongTags = peer.strongTags || [];
    const peerWeakTags = peer.weakTags || [];

    // B teaches A: intersection of Peer's strongTags and User's weakTags
    const bTeachesA = peerStrongTags.filter((tag) =>
      userWeakSet.has((tag._id || tag).toString())
    );

    // A teaches B: intersection of User's strongTags and Peer's weakTags
    const aTeachesB = (currentUser.strongTags || []).filter((tag) => {
      const tagId = (tag._id || tag).toString();
      return peerWeakTags.some((pt) => (pt._id || pt).toString() === tagId);
    });

    // Both directions must have at least one complementary skill (Cycle of Length 2)
    if (bTeachesA.length > 0 && aTeachesB.length > 0) {
      matches.push({
        peer,
        aTeachesB,
        bTeachesA,
      });
    }
  }

  return matches;
};

const getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const currentUser = await User.findById(currentUserId)
      .populate('strongTags')
      .populate('weakTags');

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!currentUser.weakTags.length || !currentUser.strongTags.length) {
      return res.status(200).json({
        success: true,
        matches: [],
        message: 'Please set both skills you want to learn and skills you can teach to discover reciprocal matches.',
      });
    }

    const weakTagIds = currentUser.weakTags.map((t) => t._id);

    // Query candidates whose strongTags overlap with current user's weakTags
    const candidatePeers = await User.find({
      _id: { $ne: currentUserId },
      strongTags: { $in: weakTagIds },
    })
      .populate('strongTags')
      .populate('weakTags')
      .select('+fullName +department +semester +contextBio +avatar');

    // Run the length-2 cycle reciprocity algorithm
    const reciprocalResults = findReciprocalMatches(currentUser, candidatePeers);

    // Look up existing matches between current user and these candidates
    const peerIds = reciprocalResults.map((r) => r.peer._id);
    const existingMatches = await Match.find({
      $or: [
        { userA: currentUserId, userB: { $in: peerIds } },
        { userB: currentUserId, userA: { $in: peerIds } },
      ],
      status: { $in: ['pending', 'accepted'] },
    });

    const matchStatusMap = new Map();
    existingMatches.forEach((m) => {
      const otherId = m.userA.toString() === currentUserId ? m.userB.toString() : m.userA.toString();
      matchStatusMap.set(otherId, {
        matchId: m._id,
        status: m.status,
        isRequester: m.userA.toString() === currentUserId,
      });
    });

    const formattedMatches = reciprocalResults.map((item) => {
      const peer = item.peer;
      const matchMeta = matchStatusMap.get(peer._id.toString()) || null;

      const learnFromPeerNames = item.bTeachesA.map((t) => t.name).join(', ');
      const teachPeerNames = item.aTeachesB.map((t) => t.name).join(', ');

      return {
        id: peer._id.toString(),
        name: peer.fullName,
        avatar: peer.avatar || peer.fullName.charAt(0).toUpperCase(),
        department: peer.department || 'CSE',
        semester: peer.semester || '2.2',
        learnFromPeer: learnFromPeerNames,
        teachPeer: teachPeerNames,
        learnFromPeerTags: item.bTeachesA,
        teachPeerTags: item.aTeachesB,
        bio: peer.contextBio || 'Enthusiastic about peer learning and knowledge exchange on SkillBridge.',
        connectionStatus: matchMeta ? matchMeta.status : null,
        isRequester: matchMeta ? matchMeta.isRequester : false,
        matchId: matchMeta ? matchMeta.matchId : null,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error('[getSuggestions Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reciprocal match suggestions.',
    });
  }
};

const sendMatchRequest = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { peerId } = req.body;

    if (!peerId) {
      return res.status(400).json({ success: false, message: 'Peer ID is required.' });
    }

    if (currentUserId === peerId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' });
    }

    const [userA, userB] = await Promise.all([
      User.findById(currentUserId).populate('strongTags').populate('weakTags'),
      User.findById(peerId).populate('strongTags').populate('weakTags'),
    ]);

    if (!userA || !userB) {
      return res.status(404).json({ success: false, message: 'User or peer not found.' });
    }

    // Check for existing active or pending match
    const existing = await Match.findOne({
      $or: [
        { userA: currentUserId, userB: peerId },
        { userA: peerId, userB: currentUserId },
      ],
      status: { $in: ['pending', 'accepted'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A connection request already exists between you and this peer.',
        match: existing,
      });
    }

    // Reciprocal intersection
    const aWeakSet = new Set(userA.weakTags.map((t) => t._id.toString()));
    const aStrongSet = new Set(userA.strongTags.map((t) => t._id.toString()));

    const bTeachesAIds = userB.strongTags
      .filter((t) => aWeakSet.has(t._id.toString()))
      .map((t) => t._id);

    const aTeachesBIds = userB.weakTags
      .filter((t) => aStrongSet.has(t._id.toString()))
      .map((t) => t._id);

    const match = new Match({
      userA: userA._id,
      userB: userB._id,
      matchedOnTags: {
        A_teaches_B: aTeachesBIds,
        B_teaches_A: bTeachesAIds,
      },
      status: 'pending',
    });

    await match.save();

    // Create notification for user B
    const learnTags = userB.strongTags.filter((t) => aWeakSet.has(t._id.toString())).map((t) => t.name).join(', ');
    const teachTags = userB.weakTags.filter((t) => aStrongSet.has(t._id.toString())).map((t) => t.name).join(', ');

    await Notification.create({
      recipient: userB._id,
      sender: userA._id,
      match: match._id,
      type: 'invite',
      message: `sent you a bridge invite for ${teachTags || 'Exchange'} ↔ ${learnTags || 'Exchange'}.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Connection request sent successfully.',
      match,
    });
  } catch (error) {
    console.error('[sendMatchRequest Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send connection request.',
    });
  }
};

const acceptMatch = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { id } = req.params;

    const match = await Match.findById(id).populate('userA', 'fullName');

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match request not found.' });
    }

    // Only recipient (userB) can accept
    if (match.userB.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient of this request can accept it.',
      });
    }

    match.status = 'accepted';
    match.respondedAt = new Date();
    await match.save();

    // Notify user A that their request was accepted
    const recipientUser = await User.findById(currentUserId);
    await Notification.create({
      recipient: match.userA._id,
      sender: currentUserId,
      match: match._id,
      type: 'accepted',
      message: `accepted your connection request. You can now start chatting.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Match accepted successfully. Chat session enabled.',
      match,
    });
  } catch (error) {
    console.error('[acceptMatch Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept match request.',
    });
  }
};

const declineMatch = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { id } = req.params;

    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match request not found.' });
    }

    if (match.userB.toString() !== currentUserId && match.userA.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this match.' });
    }

    match.status = 'declined';
    match.respondedAt = new Date();
    await match.save();

    return res.status(200).json({
      success: true,
      message: 'Match request declined.',
      match,
    });
  } catch (error) {
    console.error('[declineMatch Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to decline match request.',
    });
  }
};

const getMatchHistory = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const matches = await Match.find({
      $or: [{ userA: currentUserId }, { userB: currentUserId }],
      status: { $in: ['accepted', 'completed'] },
    })
      .populate('userA', 'fullName avatar department semester')
      .populate('userB', 'fullName avatar department semester')
      .populate('matchedOnTags.A_teaches_B', 'name')
      .populate('matchedOnTags.B_teaches_A', 'name')
      .sort({ updatedAt: -1 });

    let totalLearnedCount = 0;
    let totalTaughtCount = 0;

    const formattedHistory = matches.map((m) => {
      const isUserA = m.userA._id.toString() === currentUserId;
      const peer = isUserA ? m.userB : m.userA;

      const learned = isUserA
        ? (m.matchedOnTags.B_teaches_A || []).map((t) => t.name)
        : (m.matchedOnTags.A_teaches_B || []).map((t) => t.name);

      const taught = isUserA
        ? (m.matchedOnTags.A_teaches_B || []).map((t) => t.name)
        : (m.matchedOnTags.B_teaches_A || []).map((t) => t.name);

      totalLearnedCount += learned.length;
      totalTaughtCount += taught.length;

      const dateObj = m.respondedAt || m.createdAt || new Date();
      const dateStr = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateObj));

      return {
        id: m._id.toString(),
        name: peer.fullName,
        avatar: peer.avatar || peer.fullName.charAt(0).toUpperCase(),
        department: peer.department || 'CSE',
        semester: peer.semester || '2.2',
        date: dateStr,
        learned,
        taught,
        status: m.status,
      };
    });

    return res.status(200).json({
      success: true,
      totalPeople: formattedHistory.length,
      totalLearned: totalLearnedCount,
      totalTaught: totalTaughtCount,
      history: formattedHistory,
    });
  } catch (error) {
    console.error('[getMatchHistory Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve match history.',
    });
  }
};

module.exports = {
  findReciprocalMatches,
  getSuggestions,
  sendMatchRequest,
  acceptMatch,
  declineMatch,
  getMatchHistory,
};
