const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, collegeId } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('User already exists', 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        collegeId
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            token: generateToken(user._id),
        });
    } else {
        return next(new AppError('Invalid user data', 400));
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // New: Verify collegeId for educators
        if (user.role === 'educator') {
            if (!req.body.collegeId || req.body.collegeId !== user.collegeId) {
                return next(new AppError('Invalid College ID for Staff', 401));
            }
        }

        user.isOnline = true;
        user.lastActive = Date.now();
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId,
            token: generateToken(user._id),
        });
    } else {
        return next(new AppError('Invalid email or password', 401));
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.weeklyGoal) {
            user.weeklyGoal = req.body.weeklyGoal;
        }
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            weeklyGoal: updatedUser.weeklyGoal,
            token: generateToken(updatedUser._id),
        });
    } else {
        return next(new AppError('User not found', 404));
    }
});

// @desc    Heartbeat to update active status
// @route   POST /api/auth/heartbeat
// @access  Private
const heartbeat = asyncHandler(async (req, res, next) => {
    const UserActivity = require('../models/UserActivity');
    const user = await User.findById(req.user._id);
    if (user) {
        user.lastActive = Date.now();
        user.isOnline = true;
        await user.save();

        // Track daily activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            await UserActivity.findOneAndUpdate(
                { user: user._id, date: today },
                { $inc: { minutes: 1 } },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error('Error updating activity:', err);
        }

        res.json({ success: true });
    } else {
        return next(new AppError('User not found', 404));
    }
});

// @desc    Logout user and clear online status
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.isOnline = false;
        user.lastActive = Date.now();
        await user.save();
        res.json({ success: true, message: 'Logged out successfully' });
    } else {
        return next(new AppError('User not found', 404));
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    heartbeat,
    logoutUser,
};
