import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCalls: 0,
        pendingCalls: 0,
        completedCalls: 0,
        activeUsers: 0,
        totalFeedback: 0
    });
    const [recentCalls, setRecentCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, callsRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get('/admin/calls')
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
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage calls, users, and monitor performance</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/calls/new" className="btn btn-primary">
                        <FiPhone /> Add New Call
                    </Link>
                    <Link to="/admin/users/new" className="btn btn-secondary">
                        <FiUsers /> Add User
                    </Link>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-info-light)' }}>
                        <FiPhone color="var(--color-info)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalCalls}</h3>
                        <p>Total Calls</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-light)' }}>
                        <FiClock color="var(--color-warning)" size={24} />
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
                        <p>Completed Calls</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-primary-light)' }}>
                        <FiUsers color="var(--color-primary)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.activeUsers}</h3>
                        <p>Active Users</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-calls-section">
                    <div className="section-header">
                        <h2>Recent Calls</h2>
                        <Link to="/admin/calls" className="view-all-link">
                            View All →
                        </Link>
                    </div>

                    <div className="calls-list">
                        {recentCalls.length === 0 ? (
                            <div className="empty-state glass-card">
                                <FiPhone size={48} color="var(--color-text-tertiary)" />
                                <p>No calls yet</p>
                                <Link to="/admin/calls/new" className="btn btn-primary">
                                    Add First Call
                                </Link>
                            </div>
                        ) : (
                            recentCalls.map((call) => (
                                <div key={call._id} className="call-item glass-card">
                                    <div className="call-info">
                                        <h3>{call.customerName}</h3>
                                        <p>{call.phoneNumber}</p>
                                        <div className="call-meta">
                                            <span className="category-badge">{call.category}</span>
                                            <span className={`badge badge-${call.status}`}>
                                                {call.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="call-details">
                                        <p className="call-date">
                                            {new Date(call.callDate).toLocaleDateString()}
                                        </p>
                                        {call.feedback && (
                                            <div className="feedback-indicator">
                                                <FiCheckCircle color="var(--color-success)" />
                                                <span>Feedback received</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="quick-actions-section glass-card">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/admin/calls" className="action-btn">
                            <FiPhone />
                            <span>Manage Calls</span>
                        </Link>
                        <Link to="/admin/users" className="action-btn">
                            <FiUsers />
                            <span>Manage Users</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
