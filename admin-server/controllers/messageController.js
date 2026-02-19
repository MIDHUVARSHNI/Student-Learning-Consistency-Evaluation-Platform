const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message to a user (Educator)
// @route   POST /api/admin/messages
// @access  Private/Admin
const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user ? req.user._id : null;

        if (!senderId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get messages for a specific user
// @route   GET /api/admin/messages/:userId
// @access  Private/Admin
const getMessagesForUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const adminId = req.user._id;

        // Fetch only messages between this admin and the specific educator/user
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: adminId },
                { sender: adminId, recipient: userId }
            ]
        }).populate('sender recipient', 'name email role').sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get unread message counts grouped by sender
// @route   GET /api/admin/messages/unread-by-sender
// @access  Private/Admin
const getUnreadCountsBySender = async (req, res) => {
    try {
        const counts = await Message.aggregate([
            {
                $match: {
                    recipient: req.user._id,
                    isRead: false
                }
            },
            {
                $group: {
                    _id: "$sender",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(counts);
    } catch (error) {
        console.error('Error getting unread counts by sender:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get unread message count for admin
// @route   GET /api/admin/messages/unread-count
// @access  Private/Admin
const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user._id,
            isRead: false
        });
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark message as read
// @route   PUT /api/admin/messages/:id/read
// @access  Private/Admin
const markMessageRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        message.isRead = true;
        await message.save();
        res.json(message);
    } catch (error) {
        console.error('Error marking message read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendMessage,
    getMessagesForUser,
    getUnreadCount,
    getUnreadCountsBySender,
    markMessageRead,
};
