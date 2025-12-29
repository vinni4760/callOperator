import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiPhone, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/axios';
import './CallManagement.css';

const CallManagement = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            const response = await api.get('/admin/calls');
            setCalls(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching calls:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this call?')) {
            return;
        }

        try {
            await api.delete(`/admin/calls/${id}`);
            setCalls(calls.filter(call => call._id !== id));
        } catch (error) {
            console.error('Error deleting call:', error);
            alert('Failed to delete call');
        }
    };

    const filteredCalls = calls.filter(call => {
        if (filter === 'all') return true;
        return call.status === filter;
    });

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="call-management">
            <header className="page-header">
                <div>
                    <h1>Call Management</h1>
                    <p>View and manage all customer calls</p>
                </div>
                <Link to="/admin/calls/new" className="btn btn-primary">
                    <FiPlus /> Add New Call
                </Link>
            </header>

            <div className="filters glass-card">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Calls ({calls.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({calls.filter(c => c.status === 'pending').length})
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({calls.filter(c => c.status === 'completed').length})
                </button>
            </div>

            {filteredCalls.length === 0 ? (
                <div className="empty-state glass-card">
                    <FiPhone size={48} color="var(--color-text-tertiary)" />
                    <p>No calls found</p>
                    <Link to="/admin/calls/new" className="btn btn-primary">
                        <FiPlus /> Add First Call
                    </Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Phone</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Duration</th>
                                <th>Priority</th>
                                <th>Assigned To</th>
                                <th>Status</th>
                                <th>Feedback</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCalls.map((call) => (
                                <tr key={call._id}>
                                    <td>
                                        <div>
                                            <strong>{call.customerName}</strong>
                                            <br />
                                            <small>{call.customerId}</small>
                                        </div>
                                    </td>
                                    <td>{call.phoneNumber}</td>
                                    <td>
                                        <span className="category-badge">{call.category}</span>
                                    </td>
                                    <td>{new Date(call.callDate).toLocaleDateString()}</td>
                                    <td>{call.duration}</td>
                                    <td>
                                        <span className={`priority-badge priority-${call.priority.toLowerCase()}`}>
                                            {call.priority}
                                        </span>
                                    </td>
                                    <td>
                                        {call.assignedUserId ? call.assignedUserId.username : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${call.status}`}>
                                            {call.status}
                                        </span>
                                    </td>
                                    <td>
                                        {call.feedback ? (
                                            <div className="feedback-cell">
                                                <FiCheckCircle color="var(--color-success)" />
                                                <span>Rating: {call.feedback.rating}/5</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-tertiary)' }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/admin/calls/edit/${call._id}`} className="icon-btn">
                                                <FiEdit />
                                            </Link>
                                            <button onClick={() => handleDelete(call._id)} className="icon-btn danger">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CallManagement;
