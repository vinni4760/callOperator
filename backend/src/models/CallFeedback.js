import mongoose from 'mongoose';

const callFeedbackSchema = new mongoose.Schema({
    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Call',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feedbackText: {
        type: String,
        required: [true, 'Please provide feedback'],
        minlength: 10
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    recordingUrl: {
        type: String,
        default: null
    },
    recordingPublicId: {
        type: String,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const CallFeedback = mongoose.model('CallFeedback', callFeedbackSchema);

export default CallFeedback;
