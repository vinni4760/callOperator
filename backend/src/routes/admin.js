import express from 'express';
import Customer from '../models/Customer.js';
import CallRecord from '../models/CallRecord.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// ====== CUSTOMER MANAGEMENT ROUTES ======

// @route   POST /api/admin/customers
// @desc    Create a new customer and assign to user
// @access  Private/Admin
router.post('/customers', async (req, res) => {
    try {
        const customerData = {
            ...req.body,
            createdBy: req.user._id
        };

        const customer = await Customer.create(customerData);
        const populatedCustomer = await Customer.findById(customer._id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        res.status(201).json({ success: true, data: populatedCustomer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/customers
// @desc    Get all customers with filters
// @access  Private/Admin
router.get('/customers', async (req, res) => {
    try {
        const { status, assignedTo, priority } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (priority) filter.priority = priority;

        const customers = await Customer.find(filter)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/customers/:id
// @desc    Get a single customer with call history
// @access  Private/Admin
router.get('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const callRecords = await CallRecord.find({ customer: req.params.id })
            .populate('user', 'username email')
            .sort({ callDate: -1 });

        res.json({
            success: true,
            data: {
                ...customer.toObject(),
                callHistory: callRecords
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/admin/customers/:id
// @desc    Update a customer (reassign, change status, etc.)
// @access  Private/Admin
router.put('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/admin/customers/:id
// @desc    Delete a customer
// @access  Private/Admin
router.delete('/customers/:id', async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Also delete associated call records
        await CallRecord.deleteMany({ customer: req.params.id });

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ====== CALL RECORDS ROUTES ======

// @route   GET /api/admin/call-records
// @desc    Get all call records with filters
// @access  Private/Admin
router.get('/call-records', async (req, res) => {
    try {
        const { user, callStatus, startDate, endDate } = req.query;
        const filter = {};

        if (user) filter.user = user;
        if (callStatus) filter.callStatus = callStatus;
        if (startDate || endDate) {
            filter.callDate = {};
            if (startDate) filter.callDate.$gte = new Date(startDate);
            if (endDate) filter.callDate.$lte = new Date(endDate);
        }

        const callRecords = await CallRecord.find(filter)
            .populate('customer', 'customerName phoneNumber email')
            .populate('user', 'username email')
            .sort({ callDate: -1 });

        res.json({ success: true, data: callRecords });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/admin/customers/:id/calls
// @desc    Get call history for specific customer
// @access  Private/Admin
router.get('/customers/:id/calls', async (req, res) => {
    try {
        const callRecords = await CallRecord.find({ customer: req.params.id })
            .populate('user', 'username email')
            .sort({ callDate: -1 });

        res.json({ success: true, data: callRecords });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ====== USER MANAGEMENT ROUTES (Unchanged) ======

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

// ====== DASHBOARD STATS ======

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const pendingCustomers = await Customer.countDocuments({ status: 'pending' });
        const contactedCustomers = await Customer.countDocuments({ status: 'contacted' });
        const completedCustomers = await Customer.countDocuments({ status: 'completed' });
        const activeUsers = await User.countDocuments({ role: 'user' });

        // Get today's call records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const callsToday = await CallRecord.countDocuments({
            callDate: { $gte: today }
        });

        res.json({
            success: true,
            data: {
                totalCustomers,
                pendingCustomers,
                contactedCustomers,
                completedCustomers,
                activeUsers,
                callsToday
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
