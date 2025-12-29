import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../api/axios';
import './CallManagement.css';

const CallForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        phoneNumber: '',
        callDate: new Date().toISOString().split('T')[0],
        duration: '',
        category: 'Support',
        priority: 'Medium',
        assignedUserId: '',
        notes: ''
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        if (isEdit) {
            fetchCall();
        }
    }, [id]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data.filter(u => u.role === 'user'));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchCall = async () => {
        try {
            const response = await api.get(`/admin/calls/${id}`);
            const call = response.data.data;
            setFormData({
                customerId: call.customerId,
                customerName: call.customerName,
                phoneNumber: call.phoneNumber,
                callDate: new Date(call.callDate).toISOString().split('T')[0],
                duration: call.duration,
                category: call.category,
                priority: call.priority,
                assignedUserId: call.assignedUserId?._id || '',
                notes: call.notes || ''
            });
        } catch (error) {
            console.error('Error fetching call:', error);
            setError('Failed to load call details');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await api.put(`/admin/calls/${id}`, formData);
            } else {
                await api.post('/admin/calls', formData);
            }
            navigate('/admin/calls');
        } catch (error) {
            console.error('Error saving call:', error);
            setError(error.response?.data?.message || 'Failed to save call');
            setLoading(false);
        }
    };

    return (
        <div className="call-form-container">
            <header className="form-header">
                <button onClick={() => navigate('/admin/calls')} className="btn btn-secondary">
                    <FiArrowLeft /> Back
                </button>
                <h1>{isEdit ? 'Edit Call' : 'Add New Call'}</h1>
            </header>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="call-form glass-card">
                <div className="form-grid">
                    <div className="input-group">
                        <label className="input-label">Customer ID *</label>
                        <input
                            type="text"
                            name="customerId"
                            className="input-field"
                            value={formData.customerId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Customer Name *</label>
                        <input
                            type="text"
                            name="customerName"
                            className="input-field"
                            value={formData.customerName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number *</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            className="input-field"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Call Date *</label>
                        <input
                            type="date"
                            name="callDate"
                            className="input-field"
                            value={formData.callDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Duration *</label>
                        <input
                            type="text"
                            name="duration"
                            className="input-field"
                            placeholder="e.g., 15:30"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Category *</label>
                        <select
                            name="category"
                            className="select-field"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="Support">Support</option>
                            <option value="Sales">Sales</option>
                            <option value="Complaint">Complaint</option>
                            <option value="Inquiry">Inquiry</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Priority *</label>
                        <select
                            name="priority"
                            className="select-field"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Assign to User</label>
                        <select
                            name="assignedUserId"
                            className="select-field"
                            value={formData.assignedUserId}
                            onChange={handleChange}
                        >
                            <option value="">Not assigned</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label className="input-label">Notes</label>
                    <textarea
                        name="notes"
                        className="textarea-field"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional notes about the call..."
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/admin/calls')} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <FiSave /> {loading ? 'Saving...' : (isEdit ? 'Update Call' : 'Create Call')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CallForm;
