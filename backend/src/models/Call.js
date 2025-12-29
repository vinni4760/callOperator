import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerId: {
        type: String,
        required: [true, 'Please provide customer ID']
    },
    customerName: {
        type: String,
        required: [true, 'Please provide customer name'],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide phone number'],
        match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number']
    },
    callDate: {
        type: Date,
        required: [true, 'Please provide call date'],
        default: Date.now
    },
    duration: {
        type: String,
        required: [true, 'Please provide call duration']
    },
    category: {
        type: String,
        required: [true, 'Please provide call category'],
        enum: ['Support', 'Sales', 'Complaint', 'Inquiry', 'Follow-up', 'Other']
    },
    priority: {
        type: String,
        required: [true, 'Please provide priority level'],
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'in-review'],
        default: 'pending'
    },
    assignedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
callSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Call = mongoose.model('Call', callSchema);

export default Call;
