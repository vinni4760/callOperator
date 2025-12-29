import express from 'express';
import Call from '../models/Call.js';
import User from '../models/User.js';
import CallFeedback from '../models/CallFeedback.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// @route   POST /api/admin/calls
// @desc    Create a new call entry
// @access  Private/Admin
router.post('/calls', async (req, res) => {
    try {
        const callData = {
            ...req.body,
            adminId: req.user._id
        };

        const call = await Call.create(callData);
        res.status(201).json({ success: true, data: call });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/calls
// @desc    Get all calls with feedback
// @access  Private/Admin
router.get('/calls', async (req, res) => {
    try {
        const calls = await Call.find()
            .populate('adminId', 'username email')
            .populate('assignedUserId', 'username email')
            .sort({ createdAt: -1 });

        // Get feedback for each call
        const callsWithFeedback = await Promise.all(
            calls.map(async (call) => {
                const feedback = await CallFeedback.findOne({ callId: call._id })
                    .populate('userId', 'username email');
                return {
                    ...call.toObject(),
                    feedback: feedback || null
                };
            })
        );

        res.json({ success: true, data: callsWithFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/calls/:id
// @desc    Get a single call
// @access  Private/Admin
router.get('/calls/:id', async (req, res) => {
    try {
        const call = await Call.findById(req.params.id)
            .populate('adminId', 'username email')
            .populate('assignedUserId', 'username email');

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        const feedback = await CallFeedback.findOne({ callId: call._id })
            .populate('userId', 'username email');

        res.json({
            success: true,
            data: {
                ...call.toObject(),
                feedback: feedback || null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/calls/:id
// @desc    Update a call
// @access  Private/Admin
router.put('/calls/:id', async (req, res) => {
    try {
        const call = await Call.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        res.json({ success: true, data: call });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/admin/calls/:id
// @desc    Delete a call
// @access  Private/Admin
router.delete('/calls/:id', async (req, res) => {
    try {
        const call = await Call.findByIdAndDelete(req.params.id);

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        // Also delete associated feedback
        await CallFeedback.deleteMany({ callId: req.params.id });

        res.json({ success: true, message: 'Call deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/users', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user'
        });

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalCalls = await Call.countDocuments();
        const pendingCalls = await Call.countDocuments({ status: 'pending' });
        const completedCalls = await Call.countDocuments({ status: 'completed' });
        const activeUsers = await User.countDocuments({ role: 'user' });
        const totalFeedback = await CallFeedback.countDocuments();

        res.json({
            success: true,
            data: {
                totalCalls,
                pendingCalls,
                completedCalls,
                activeUsers,
                totalFeedback
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
