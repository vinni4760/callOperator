import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPhone, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';
import './UserDashboard.css';

const UserDashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({
        assignedCustomers: 0,
        pendingCustomers: 0,
        contactedCustomers: 0,
        completedCustomers: 0,
        totalCallRecords: 0,
        callsToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, [filterStatus]);

    const fetchDashboardData = async () => {
        try {
            const params = filterStatus ? `?status=${filterStatus}` : '';
            const [customersRes, statsRes] = await Promise.all([
                api.get(`/user/assigned-customers${params}`),
                api.get('/user/dashboard/stats')
            ]);

            setCustomers(customersRes.data.data);
            setStats(statsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'urgent':
                return <FiAlertCircle color="var(--color-error)" />;
            case 'high':
                return <FiAlertCircle color="var(--color-warning)" />;
            default:
                return <FiPhone />;
        }
    };

    const handleCardClick = (customerId) => {
        navigate(`/user/call-record/${customerId}`);
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
                    <p>View and manage your assigned customers</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-info-light)' }}>
                        <FiPhone color="var(--color-info)" size={20} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.assignedCustomers}</h3>
                        <p>Assigned Customers</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-warning-light)' }}>
                        <FiClock color="var(--color-warning)" size={20} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pendingCustomers}</h3>
                        <p>Pending Calls</p>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'var(--color-success-light)' }}>
                        <FiCheckCircle color="var(--color-success)" size={20} />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.callsToday}</h3>
                        <p>Calls Today</p>
                    </div>
                </div>
            </div>

            <div className="filters glass-card">
                <button
                    className={`filter-btn ${filterStatus === '' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('pending')}
                >
                    Pending
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'contacted' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('contacted')}
                >
                    Contacted
                </button>
                <button
                    className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('completed')}
                >
                    Completed
                </button>
            </div>

            <div className="calls-list">
                {customers.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FiPhone size={48} color="var(--color-text-tertiary)" />
                        <p>No customers assigned yet</p>
                    </div>
                ) : (
                    customers.map((customer) => (
                        <div
                            key={customer._id}
                            className="call-card glass-card"
                            onClick={() => handleCardClick(customer._id)}
                            title="Click to view details and add call record"
                        >
                            <div className="card-compact">
                                <div className="compact-info">
                                    <div className="priority-icon">
                                        {getPriorityIcon(customer.priority)}
                                    </div>
                                    <div className="compact-details">
                                        <h3>{customer.customerName}</h3>
                                        <p className="phone-number">
                                            <FiPhone size={12} />
                                            {customer.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="compact-badges">
                                    <span className={`badge badge-${customer.status}`}>
                                        {customer.status}
                                    </span>
                                    <span className={`priority-badge priority-${customer.priority}`}>
                                        {customer.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
