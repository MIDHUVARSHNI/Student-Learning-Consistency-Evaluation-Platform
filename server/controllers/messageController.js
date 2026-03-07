const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get messages for the logged-in user
// @route   GET /api/messages
// @access  Private
const getMyMessages = asyncHandler(async (req, res, next) => {
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
            const sender = m.sender;
            const recipient = m.recipient;
            if (!sender || !recipient) return false;
            const otherPerson = sender._id.toString() === userId.toString() ? recipient : sender;
            return otherPerson.role === senderRole;
        });

        return res.json(filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }

    const messages = await Message.find(query)
        .populate('sender', 'name email role')
        .populate('recipient', 'name email role')
        .sort({ createdAt: 1 });

    res.json(messages);
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageRead = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return next(new AppError('Message not found', 404));
    }

    // Check if the user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 401));
    }

    message.isRead = true;
    await message.save();

    res.json(message);
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res, next) => {
    const { senderRole } = req.query;
    let query = {
        recipient: req.user._id,
        isRead: false
    };

    if (senderRole) {
        const messages = await Message.find(query).populate('sender', 'role');
        const count = messages.filter(m => m.sender && m.sender.role === senderRole).length;
        return res.json({ count });
    }

    const count = await Message.countDocuments(query);
    res.json({ count });
});

// @desc    Get unread counts grouped by sender
// @route   GET /api/messages/unread-counts-by-sender
// @access  Private
const getUnreadCountsBySender = asyncHandler(async (req, res, next) => {
    const unreadMessages = await Message.find({
        recipient: req.user._id,
        isRead: false
    }).select('sender');

    const counts = {};
    unreadMessages.forEach(msg => {
        counts[msg.sender] = (counts[msg.sender] || 0) + 1;
    });

    res.json(counts);
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res, next) => {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !content) {
        return next(new AppError('Recipient and content are required', 400));
    }

    const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content,
    });

    res.status(201).json(message);
});

// @desc    Get all admin users
// @route   GET /api/messages/admins
// @access  Private
const getAdmins = asyncHandler(async (req, res, next) => {
    const admins = await User.find({ role: 'admin' }).select('name email role');
    res.json(admins);
});

module.exports = {
    getMyMessages,
    markMessageRead,
    getUnreadCount,
    getUnreadCountsBySender,
    getAdmins,
    sendMessage,
};
