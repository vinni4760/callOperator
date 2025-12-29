import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/axios';

const CallList = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            const response = await api.get('/user/calls');
            setCalls(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching calls:', error);
            setLoading(false);
        }
    };

    const filteredCalls = calls.filter(call => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !call.hasFeedback;
        if (filter === 'completed') return call.hasFeedback;
        return true;
    });

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
                    <h1>My Calls</h1>
                    <p>View all assigned calls and submit feedback</p>
                </div>
            </header>

            <div className="filters glass-card">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({calls.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending Feedback ({calls.filter(c => !c.hasFeedback).length})
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed ({calls.filter(c => c.hasFeedback).length})
                </button>
            </div>

            <div className="calls-list">
                {filteredCalls.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FiPhone size={48} color="var(--color-text-tertiary)" />
                        <p>No calls found</p>
                    </div>
                ) : (
                    filteredCalls.map((call) => (
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
    );
};

export default CallList;
