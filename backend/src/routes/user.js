import express from 'express';
import Call from '../models/Call.js';
import CallFeedback from '../models/CallFeedback.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/user/calls
// @desc    Get assigned calls for the logged-in user
// @access  Private/User
router.get('/calls', async (req, res) => {
    try {
        const calls = await Call.find({ assignedUserId: req.user._id })
            .populate('adminId', 'username email')
            .sort({ createdAt: -1 });

        // Check if feedback exists for each call
        const callsWithFeedbackStatus = await Promise.all(
            calls.map(async (call) => {
                const feedback = await CallFeedback.findOne({ callId: call._id });
                return {
                    ...call.toObject(),
                    hasFeedback: !!feedback
                };
            })
        );

        res.json({ success: true, data: callsWithFeedbackStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/user/calls/:id
// @desc    Get a specific call details
// @access  Private/User
router.get('/calls/:id', async (req, res) => {
    try {
        const call = await Call.findById(req.params.id)
            .populate('adminId', 'username email');

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        // Check if this call is assigned to the current user
        if (call.assignedUserId && call.assignedUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const feedback = await CallFeedback.findOne({ callId: call._id });

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

// @route   POST /api/user/feedback
// @desc    Submit feedback for a call (with optional recording)
// @access  Private/User
router.post('/feedback', upload.single('recording'), async (req, res) => {
    try {
        const { callId, feedbackText, rating } = req.body;

        // Check if call exists and is assigned to user
        const call = await Call.findById(callId);

        if (!call) {
            return res.status(404).json({ success: false, message: 'Call not found' });
        }

        if (call.assignedUserId && call.assignedUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Check if feedback already exists
        const existingFeedback = await CallFeedback.findOne({ callId });

        if (existingFeedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback already submitted for this call'
            });
        }

        // Create feedback with recording URL if uploaded
        const feedbackData = {
            callId,
            userId: req.user._id,
            feedbackText,
            rating: parseInt(rating)
        };

        // Add recording URL if file was uploaded
        if (req.file) {
            feedbackData.recordingUrl = req.file.path;
            feedbackData.recordingPublicId = req.file.filename;
        }

        const feedback = await CallFeedback.create(feedbackData);

        // Update call status to completed
        call.status = 'completed';
        await call.save();

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/user/upload-recording/:feedbackId
// @desc    Upload or update recording for existing feedback
// @access  Private/User
router.post('/upload-recording/:feedbackId', upload.single('recording'), async (req, res) => {
    try {
        const feedback = await CallFeedback.findById(req.params.feedbackId);

        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        // Verify user owns this feedback
        if (feedback.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Update feedback with new recording
        feedback.recordingUrl = req.file.path;
        feedback.recordingPublicId = req.file.filename;
        await feedback.save();

        res.json({ success: true, data: feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/user/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private/User
router.get('/dashboard/stats', async (req, res) => {
    try {
        const assignedCalls = await Call.countDocuments({ assignedUserId: req.user._id });
        const completedCalls = await Call.countDocuments({
            assignedUserId: req.user._id,
            status: 'completed'
        });
        const pendingCalls = await Call.countDocuments({
            assignedUserId: req.user._id,
            status: 'pending'
        });
        const submittedFeedback = await CallFeedback.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            data: {
                assignedCalls,
                completedCalls,
                pendingCalls,
                submittedFeedback
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
