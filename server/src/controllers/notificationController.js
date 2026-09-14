const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const notifications = await Notification.find({ recipient: currentUserId })
      .populate('sender', 'fullName avatar department')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: currentUserId,
      read: false,
    });

    const formatted = notifications.map((n) => {
      const timeDiffMs = Date.now() - new Date(n.createdAt).getTime();
      let timeStr = 'Just now';
      const minutes = Math.floor(timeDiffMs / (1000 * 60));
      const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
      const days = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));

      if (minutes < 1) {
        timeStr = 'Just now';
      } else if (minutes < 60) {
        timeStr = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      } else if (hours < 24) {
        timeStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (days === 1) {
        timeStr = 'Yesterday';
      } else {
        timeStr = `${days} days ago`;
      }

      return {
        id: n._id.toString(),
        matchId: n.match ? n.match.toString() : null,
        type: n.type,
        name: n.sender?.fullName || 'Peer Student',
        avatar: n.sender?.avatar || n.sender?.fullName?.charAt(0).toUpperCase() || 'S',
        department: n.sender?.department || 'AUST',
        message: n.message,
        time: timeStr,
        read: n.read,
        createdAt: n.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    console.error('[getNotifications Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.',
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: currentUserId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
    });
  }
};

const markAllRead = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    await Notification.updateMany({ recipient: currentUserId, read: false }, { read: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read.',
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
};
