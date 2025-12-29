import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../api/axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        pendingCustomers: 0,
        contactedCustomers: 0,
        completedCustomers: 0,
        activeUsers: 0,
        callsToday: 0
    });
    const [recentCustomers, setRecentCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, customersRes] = await Promise.all([
                api.get('/admin/dashboard/stats'),
                api.get('/admin/customers')
            ]);

            setStats(statsRes.data.data);
            setRecentCustomers(customersRes.data.data.slice(0, 5));
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
                    <p>Manage customers, users, and monitor call activities</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/customers" className="btn btn-primary">
                        <FiPhone /> Add Customer
                    </Link>
                    <Link to="/admin/users" className="btn btn-secondary">
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
                        <h3>{stats.totalCustomers}</h3>
                        <p>Total Customers</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-light)' }}>
                        <FiClock color="var(--color-warning)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingCustomers}</h3>
                        <p>Pending Calls</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>
                        <FiCheckCircle color="var(--color-success)" size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.callsToday}</h3>
                        <p>Calls Today</p>
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
                        <h2>Recent Customers</h2>
                        <Link to="/admin/customers" className="view-all-link">
                            View All →
                        </Link>
                    </div>

                    <div className="calls-list">
                        {recentCustomers.length === 0 ? (
                            <div className="empty-state glass-card">
                                <FiPhone size={48} color="var(--color-text-tertiary)" />
                                <p>No customers yet</p>
                                <Link to="/admin/customers" className="btn btn-primary">
                                    Add First Customer
                                </Link>
                            </div>
                        ) : (
                            recentCustomers.map((customer) => (
                                <div key={customer._id} className="call-item glass-card">
                                    <div className="call-info">
                                        <h3>{customer.customerName}</h3>
                                        <p>{customer.phoneNumber}</p>
                                        <div className="call-meta">
                                            <span className="category-badge">
                                                <FiUsers size={12} /> {customer.assignedTo?.username}
                                            </span>
                                            <span className={`badge badge-${customer.status}`}>
                                                {customer.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="call-details">
                                        <span className={`priority-badge priority-${customer.priority}`}>
                                            {customer.priority}
                                        </span>
                                        <p className="call-date">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="quick-actions-section glass-card">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/admin/customers" className="action-btn">
                            <FiPhone />
                            <span>Manage Customers</span>
                        </Link>
                        <Link to="/admin/call-records" className="action-btn">
                            <FiCheckCircle />
                            <span>View Call Records</span>
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
