const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get messages for the logged-in user
// @route   GET /api/messages
// @access  Private
const getMyMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId, senderRole } = req.query;

        let query = {
            $or: [{ sender: userId }, { recipient: userId }]
        };

        if (otherUserId) {
            query = {
                $or: [
                    { sender: userId, recipient: otherUserId },
                    { sender: otherUserId, recipient: userId }
                ]
            };
        } else if (senderRole) {
            // Fetch messages where user is involved AND the other person has the specified role
            const allMessages = await Message.find({
                $or: [{ sender: userId }, { recipient: userId }]
            })
                .populate('sender', 'name email role')
                .populate('recipient', 'name email role');

            const filteredMessages = allMessages.filter(m => {
                const otherPerson = m.sender._id.toString() === userId.toString() ? m.recipient : m.sender;
                return otherPerson.role === senderRole;
            });

            return res.json(filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        }

        const messages = await Message.find(query)
            .populate('sender', 'name email role')
            .populate('recipient', 'name email role')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageRead = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if the user is the recipient
        if (message.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        message.isRead = true;
        await message.save();

        res.json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        const { senderRole } = req.query;
        let query = {
            recipient: req.user._id,
            isRead: false
        };

        if (senderRole) {
            const messages = await Message.find(query).populate('sender', 'role');
            const count = messages.filter(m => m.sender.role === senderRole).length;
            return res.json({ count });
        }

        const count = await Message.countDocuments(query);
        res.json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get unread counts grouped by sender
// @route   GET /api/messages/unread-counts-by-sender
// @access  Private
const getUnreadCountsBySender = async (req, res) => {
    try {
        const unreadMessages = await Message.find({
            recipient: req.user._id,
            isRead: false
        }).select('sender');

        const counts = {};
        unreadMessages.forEach(msg => {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
        });

        res.json(counts);
    } catch (error) {
        console.error('Error getting unread counts by sender:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user._id;

        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content,
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all admin users
// @route   GET /api/messages/admins
// @access  Private
const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('name email role');
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyMessages,
    markMessageRead,
    getUnreadCount,
    getUnreadCountsBySender,
    getAdmins,
    sendMessage,
};
