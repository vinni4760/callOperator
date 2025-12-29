import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPhone, FiClock, FiMic, FiCheckCircle, FiCalendar, FiChevronLeft, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import api from '../../api/axios';
import './CallRecordForm.css';

const CallRecordForm = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        callDate: new Date().toISOString().slice(0, 16),
        duration: '',
        callStatus: 'successful',
        feedback: '',
        followUpRequired: false,
        followUpDate: ''
    });
    const [recordingFile, setRecordingFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusDropdownRef = useRef(null);

    const statusOptions = [
        { value: 'successful', label: 'Successful' },
        { value: 'no-answer', label: 'No Answer' },
        { value: 'busy', label: 'Busy' },
        { value: 'voicemail', label: 'Voicemail' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const fetchCustomer = async () => {
        try {
            const response = await api.get(`/user/customers/${customerId}`);
            setCustomer(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customer:', error);
            setError('Failed to load customer details');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type (audio files)
            const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid audio file (MP3, WAV, OGG, WEBM)');
                return;
            }
            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }
            setRecordingFile(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const submitData = new FormData();
            submitData.append('customerId', customerId);
            submitData.append('callDate', formData.callDate);
            submitData.append('duration', formData.duration);
            submitData.append('callStatus', formData.callStatus);
            submitData.append('feedback', formData.feedback);
            submitData.append('followUpRequired', formData.followUpRequired);
            if (formData.followUpDate) {
                submitData.append('followUpDate', formData.followUpDate);
            }
            if (recordingFile) {
                submitData.append('recording', recordingFile);
            }

            await api.post('/user/call-records', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Call record submitted successfully!');
            setTimeout(() => {
                navigate('/user/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error submitting call record:', error);
            setError(error.response?.data?.message || 'Failed to submit call record');
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

    if (!customer) {
        return (
            <div className="error-state">
                <p>Customer not found</p>
            </div>
        );
    }

    return (
        <div className="call-record-form-container">
            <header className="page-header">
                <h1>Submit Call Record</h1>
                <p>Record details of your call with the customer</p>
            </header>

            <div className="customer-info-card glass-card">
                <h2>Customer Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">Name</span>
                        <span className="value">{customer.customerName}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">
                            <FiPhone size={14} /> Phone
                        </span>
                        <span className="value">{customer.phoneNumber}</span>
                    </div>
                    {customer.email && (
                        <div className="info-item">
                            <span className="label">Email</span>
                            <span className="value">{customer.email}</span>
                        </div>
                    )}
                    <div className="info-item">
                        <span className="label">Status</span>
                        <span className={`badge badge-${customer.status}`}>
                            {customer.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="call-record-form glass-card">
                <h2>Call Details</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">
                                <FiCalendar size={16} /> Call Date & Time *
                            </label>
                            <div className="date-picker-wrapper-custom">
                                <DatePicker
                                    selected={formData.callDate ? new Date(formData.callDate) : new Date()}
                                    onChange={(date) => setFormData({ ...formData, callDate: date ? date.toISOString() : '' })}
                                    showTimeSelect
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    className="input-field"
                                    wrapperClassName="date-picker-full-width"
                                    calendarClassName="custom-datepicker"
                                    placeholderText="Select date and time"
                                    required
                                    renderCustomHeader={({
                                        date,
                                        decreaseMonth,
                                        increaseMonth,
                                        prevMonthButtonDisabled,
                                        nextMonthButtonDisabled,
                                    }) => (
                                        <div className="custom-calendar-header">
                                            <button
                                                onClick={decreaseMonth}
                                                disabled={prevMonthButtonDisabled}
                                                type="button"
                                                className="calendar-nav-btn"
                                            >
                                                <FiChevronLeft />
                                            </button>
                                            <span className="calendar-month-year">
                                                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button
                                                onClick={increaseMonth}
                                                disabled={nextMonthButtonDisabled}
                                                type="button"
                                                className="calendar-nav-btn"
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <FiClock size={16} /> Duration (minutes)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                className="input-field"
                                value={formData.duration}
                                onChange={handleChange}
                                min="0"
                                placeholder="e.g. 15"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Call Status *</label>
                        <div className="custom-select-wrapper" ref={statusDropdownRef}>
                            <div
                                className={`custom-select-trigger ${isStatusOpen ? 'open' : ''}`}
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                            >
                                <span>
                                    {statusOptions.find(opt => opt.value === formData.callStatus)?.label || 'Select Status'}
                                </span>
                                <FiChevronDown className={`select-arrow-icon ${isStatusOpen ? 'rotate' : ''}`} />
                            </div>
                            {isStatusOpen && (
                                <div className="custom-select-options">
                                    {statusOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`custom-option ${formData.callStatus === option.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setFormData({ ...formData, callStatus: option.value });
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Feedback / Notes</label>
                        <textarea
                            name="feedback"
                            className="textarea-field"
                            value={formData.feedback}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Enter call notes, customer feedback, or any important details..."
                        ></textarea>
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiMic size={16} /> Call Recording (Optional)
                        </label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="file-input"
                                id="recording-upload"
                            />
                            <label htmlFor="recording-upload" className="file-input-label">
                                <FiMic size={20} />
                                <span>{recordingFile ? recordingFile.name : 'Choose audio file'}</span>
                            </label>
                        </div>
                        <small className="input-help">
                            Supported formats: MP3, WAV, OGG, WEBM (Max 50MB)
                        </small>
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="followUpRequired"
                            id="followUpRequired"
                            checked={formData.followUpRequired}
                            onChange={handleChange}
                        />
                        <label htmlFor="followUpRequired">
                            Follow-up required
                        </label>
                    </div>

                    {formData.followUpRequired && (
                        <div className="input-group">
                            <label className="input-label">Follow-up Date</label>
                            <div className="date-picker-wrapper-custom">
                                <DatePicker
                                    selected={formData.followUpDate ? new Date(formData.followUpDate) : null}
                                    onChange={(date) => setFormData({ ...formData, followUpDate: date ? date.toISOString().split('T')[0] : '' })}
                                    dateFormat="MMM d, yyyy"
                                    className="input-field"
                                    wrapperClassName="date-picker-full-width"
                                    calendarClassName="custom-datepicker"
                                    placeholderText="Select follow-up date"
                                    renderCustomHeader={({
                                        date,
                                        decreaseMonth,
                                        increaseMonth,
                                        prevMonthButtonDisabled,
                                        nextMonthButtonDisabled,
                                    }) => (
                                        <div className="custom-calendar-header">
                                            <button
                                                onClick={decreaseMonth}
                                                disabled={prevMonthButtonDisabled}
                                                type="button"
                                                className="calendar-nav-btn"
                                            >
                                                <FiChevronLeft />
                                            </button>
                                            <span className="calendar-month-year">
                                                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </span>
                                            <button
                                                onClick={increaseMonth}
                                                disabled={nextMonthButtonDisabled}
                                                type="button"
                                                className="calendar-nav-btn"
                                            >
                                                <FiChevronRight />
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/user/dashboard')}
                            className="btn btn-secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <div className="spinner-small"></div> Submitting...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle /> Submit Call Record
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CallRecordForm;
