import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiUpload, FiStar } from 'react-icons/fi';
import api from '../../api/axios';
import './FeedbackForm.css';

const FeedbackForm = () => {
    const { callId } = useParams();
    const navigate = useNavigate();

    const [call, setCall] = useState(null);
    const [formData, setFormData] = useState({
        feedbackText: '',
        rating: 5
    });
    const [recording, setRecording] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCallDetails();
    }, [callId]);

    const fetchCallDetails = async () => {
        try {
            const response = await api.get(`/user/calls/${callId}`);
            setCall(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching call:', error);
            setError('Failed to load call details');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mpeg', 'audio/m4a'];
            if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)) {
                setError('Please upload a valid audio file (mp3, wav, ogg, webm, m4a)');
                return;
            }

            // Validate file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }

            setRecording(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('callId', callId);
            formDataToSend.append('feedbackText', formData.feedbackText);
            formDataToSend.append('rating', formData.rating);

            if (recording) {
                formDataToSend.append('recording', recording);
            }

            await api.post('/user/feedback', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            navigate('/user/calls');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError(error.response?.data?.message || 'Failed to submit feedback');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!call) {
        return (
            <div className="feedback-container">
                <div className="error-message">Call not found</div>
            </div>
        );
    }

    return (
        <div className="feedback-container">
            <header className="form-header">
                <button onClick={() => navigate('/user/calls')} className="btn btn-secondary">
                    <FiArrowLeft /> Back
                </button>
                <h1>Submit Feedback</h1>
            </header>

            <div className="call-info-card glass-card">
                <h2>Call Details</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Customer:</span>
                        <span className="value">{call.customerName}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Phone:</span>
                        <span className="value">{call.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Category:</span>
                        <span className="value">{call.category}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Duration:</span>
                        <span className="value">{call.duration}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="feedback-form glass-card">
                <h2>Your Feedback</h2>

                <div className="input-group">
                    <label className="input-label">Rating *</label>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, rating: star })}
                            >
                                <FiStar size={32} />
                            </button>
                        ))}
                    </div>
                    <p className="rating-text">{formData.rating} out of 5 stars</p>
                </div>

                <div className="input-group">
                    <label className="input-label">Feedback *</label>
                    <textarea
                        name="feedbackText"
                        className="textarea-field"
                        value={formData.feedbackText}
                        onChange={handleChange}
                        placeholder="Describe your experience with this call..."
                        required
                        minLength={10}
                        rows={6}
                    ></textarea>
                </div>

                <div className="input-group">
                    <label className="input-label">
                        <FiUpload /> Upload Call Recording (Optional)
                    </label>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="recording"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <label htmlFor="recording" className="file-input-label">
                            {recording ? recording.name : 'Choose audio file (mp3, wav, ogg, m4a)'}
                        </label>
                    </div>
                    {recording && (
                        <div className="file-info">
                            <span>Selected: {recording.name}</span>
                            <span>Size: {(recording.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/user/calls')}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-success" disabled={submitting}>
                        <FiSend /> {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FeedbackForm;
