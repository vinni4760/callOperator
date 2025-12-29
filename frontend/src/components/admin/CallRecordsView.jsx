import { useState, useEffect } from 'react';
import { FiPhone, FiUser, FiClock, FiFileText, FiPlay } from 'react-icons/fi';
import api from '../../api/axios';
import './CallRecordsView.css';

const CallRecordsView = () => {
    const [callRecords, setCallRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterUser, setFilterUser] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchCallRecords();
        fetchUsers();
    }, [filterUser]);

    const fetchCallRecords = async () => {
        try {
            const params = filterUser ? `?user=${filterUser}` : '';
            const response = await api.get(`/admin/call-records${params}`);
            setCallRecords(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching call records:', error);
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data.filter(u => u.role === 'user'));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="call-records-view">
            <header className="page-header">
                <div>
                    <h1>Call Records</h1>
                    <p>View all call records submitted by users</p>
                </div>
            </header>

            <div className="filters glass-card">
                <div className="input-group">
                    <label className="input-label">Filter by User</label>
                    <select
                        className="select-field"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    >
                        <option value="">All Users</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="call-records-grid">
                {callRecords.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FiFileText size={48} color="var(--color-text-tertiary)" />
                        <p>No call records found</p>
                    </div>
                ) : (
                    callRecords.map((record) => (
                        <div key={record._id} className="call-record-card glass-card">
                            <div className="record-header">
                                <div className="customer-info">
                                    <h3>{record.customer?.customerName}</h3>
                                    <p className="phone-number">
                                        <FiPhone size={14} />
                                        {record.customer?.phoneNumber}
                                    </p>
                                </div>
                                <span className={`badge badge-${record.callStatus}`}>
                                    {record.callStatus}
                                </span>
                            </div>

                            <div className="record-details">
                                <div className="detail-row">
                                    <span className="label">
                                        <FiUser size={14} /> User
                                    </span>
                                    <span className="value">{record.user?.username}</span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">
                                        <FiClock size={14} /> Call Date
                                    </span>
                                    <span className="value">
                                        {new Date(record.callDate).toLocaleString()}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="label">Duration</span>
                                    <span className="value">{formatDuration(record.duration)}</span>
                                </div>

                                {record.feedback && (
                                    <div className="feedback-section">
                                        <h4>Feedback</h4>
                                        <p>{record.feedback}</p>
                                    </div>
                                )}

                                {record.callRecording && (
                                    <div className="recording-section">
                                        <audio controls style={{ width: '100%' }}>
                                            <source src={record.callRecording} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {record.followUpRequired && (
                                    <div className="follow-up-badge">
                                        Follow-up needed: {new Date(record.followUpDate).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CallRecordsView;
