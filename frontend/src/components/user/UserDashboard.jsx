import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';
import './UserDashboard.css';

const UserDashboard = () => {
    const [stats, setStats] = useState({
        assignedCalls: 0,
        completedCalls: 0,
        pendingCalls: 0,
        submittedFeedback: 0
    });
    const [recentCalls, setRecentCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, callsRes] = await Promise.all([
                api.get('/user/dashboard/stats'),
                api.get('/user/calls')
            ]);

            setStats(statsRes.data.data);
            setRecentCalls(callsRes.data.data.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>My Dashboard</h1>
                    <p>View your assigned calls and submit feedback</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-info-light)' }}>
                        <FiPhone color="var(--color-info)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.assignedCalls}</h3>
                        <p>Assigned Calls</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-light)' }}>
                        <FiAlertCircle color="var(--color-warning)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingCalls}</h3>
                        <p>Pending Feedback</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>
                        <FiCheckCircle color="var(--color-success)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.completedCalls}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            <div className="calls-section">
                <div className="section-header">
                    <h2>My Assigned Calls</h2>
                    <Link to="/user/calls" className="view-all-link">
                        View All →
                    </Link>
                </div>

                <div className="calls-list">
                    {recentCalls.length === 0 ? (
                        <div className="empty-state glass-card">
                            <FiPhone size={48} color="var(--color-text-tertiary)" />
                            <p>No calls assigned yet</p>
                        </div>
                    ) : (
                        recentCalls.map((call) => (
                            <div key={call._id} className="call-card glass-card">
                                <div className="call-header">
                                    <div>
                                        <h3>{call.customerName}</h3>
                                        <p>{call.phoneNumber}</p>
                                    </div>
                                    <span className={`badge badge-${call.status}`}>
                                        {call.status}
                                    </span>
                                </div>

                                <div className="call-details">
                                    <div className="detail-item">
                                        <span className="label">Category:</span>
                                        <span className="value">{call.category}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Duration:</span>
                                        <span className="value">{call.duration}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Date:</span>
                                        <span className="value">
                                            {new Date(call.callDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {!call.hasFeedback && (
                                    <Link to={`/user/feedback/${call._id}`} className="btn btn-primary w-full">
                                        <FiCheckCircle /> Submit Feedback
                                    </Link>
                                )}

                                {call.hasFeedback && (
                                    <div className="feedback-submitted">
                                        <FiCheckCircle color="var(--color-success)" />
                                        <span>Feedback submitted</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
