import mongoose from 'mongoose';

const callRecordSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    callDate: {
        type: Date,
        required: [true, 'Call date is required'],
        default: Date.now
    },
    duration: {
        type: Number, // Duration in minutes
        min: 0
    },
    callRecording: {
        type: String // Cloudinary URL
    },
    callStatus: {
        type: String,
        enum: ['successful', 'no-answer', 'busy', 'voicemail'],
        required: [true, 'Call status is required']
    },
    feedback: {
        type: String
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
callRecordSchema.index({ customer: 1, user: 1 });
callRecordSchema.index({ callDate: -1 });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);

export default CallRecord;
