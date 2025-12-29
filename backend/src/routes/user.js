import express from 'express';
import Customer from '../models/Customer.js';
import CallRecord from '../models/CallRecord.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// ====== ASSIGNED CUSTOMERS ROUTES ======

// @route   GET /api/user/assigned-customers
// @desc    Get customers assigned to the logged-in user
// @access  Private/User
router.get('/assigned-customers', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { assignedTo: req.user._id };

        if (status) filter.status = status;

        const customers = await Customer.find(filter)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        // Get call history for each customer
        const customersWithCalls = await Promise.all(
            customers.map(async (customer) => {
                const callCount = await CallRecord.countDocuments({
                    customer: customer._id,
                    user: req.user._id
                });
                return {
                    ...customer.toObject(),
                    callCount
                };
            })
        );

        res.json({ success: true, data: customersWithCalls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/user/customers/:id
// @desc    Get details of a specific assigned customer
// @access  Private/User
router.get('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('createdBy', 'username email');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Check if this customer is assigned to the current user
        if (customer.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Get call history for this customer by this user
        const callHistory = await CallRecord.find({
            customer: req.params.id,
            user: req.user._id
        }).sort({ callDate: -1 });

        res.json({
            success: true,
            data: {
                ...customer.toObject(),
                callHistory
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/user/customers/:id/status
// @desc    Update customer status
// @access  Private/User
router.put('/customers/:id/status', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Check if this customer is assigned to the current user
        if (customer.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        customer.status = req.body.status;
        await customer.save();

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ====== CALL RECORD ROUTES ======

// @route   POST /api/user/call-records
// @desc    Submit call record after making a call
// @access  Private/User
router.post('/call-records', upload.single('recording'), async (req, res) => {
    try {
        const { customerId, callDate, duration, callStatus, feedback, followUpRequired, followUpDate } = req.body;

        // Check if customer exists and is assigned to user
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        if (customer.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Create call record
        const callRecordData = {
            customer: customerId,
            user: req.user._id,
            callDate: callDate || new Date(),
            duration: duration ? parseInt(duration) : undefined,
            callStatus,
            feedback,
            followUpRequired: followUpRequired === 'true' || followUpRequired === true,
            followUpDate: followUpDate || null
        };

        // Add recording URL if file was uploaded
        if (req.file) {
            callRecordData.callRecording = req.file.path;
        }

        const callRecord = await CallRecord.create(callRecordData);

        // Update customer status to 'contacted' if successful call
        if (callStatus === 'successful' && customer.status === 'pending') {
            customer.status = 'contacted';
            await customer.save();
        }

        const populatedRecord = await CallRecord.findById(callRecord._id)
            .populate('customer', 'customerName phoneNumber email')
            .populate('user', 'username email');

        res.status(201).json({ success: true, data: populatedRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/user/call-records
// @desc    Get logged-in user's call history
// @access  Private/User
router.get('/call-records', async (req, res) => {
    try {
        const callRecords = await CallRecord.find({ user: req.user._id })
            .populate('customer', 'customerName phoneNumber email')
            .sort({ callDate: -1 });

        res.json({ success: true, data: callRecords });
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
        const assignedCustomers = await Customer.countDocuments({ assignedTo: req.user._id });
        const pendingCustomers = await Customer.countDocuments({
            assignedTo: req.user._id,
            status: 'pending'
        });
        const contactedCustomers = await Customer.countDocuments({
            assignedTo: req.user._id,
            status: 'contacted'
        });
        const completedCustomers = await Customer.countDocuments({
            assignedTo: req.user._id,
            status: 'completed'
        });
        const totalCallRecords = await CallRecord.countDocuments({ user: req.user._id });

        // Get today's call records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const callsToday = await CallRecord.countDocuments({
            user: req.user._id,
            callDate: { $gte: today }
        });

        res.json({
            success: true,
            data: {
                assignedCustomers,
                pendingCustomers,
                contactedCustomers,
                completedCustomers,
                totalCallRecords,
                callsToday
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
