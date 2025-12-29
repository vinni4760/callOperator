import { useState, useEffect } from 'react';
import { FiPhone, FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import api from '../../api/axios';
import './CustomerManagement.css';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        phoneNumber: '',
        email: '',
        address: '',
        assignedTo: '',
        priority: 'medium',
        notes: ''
    });
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchCustomers();
        fetchUsers();
    }, [filterStatus]);

    const fetchCustomers = async () => {
        try {
            const params = filterStatus ? `?status=${filterStatus}` : '';
            const response = await api.get(`/admin/customers${params}`);
            setCustomers(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching customers:', error);
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/admin/customers', formData);
            setFormData({
                customerName: '',
                phoneNumber: '',
                email: '',
                address: '',
                assignedTo: '',
                priority: 'medium',
                notes: ''
            });
            setShowForm(false);
            fetchCustomers();
        } catch (error) {
            console.error('Error creating customer:', error);
            setError(error.response?.data?.message || 'Failed to create customer');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/admin/customers/${id}`);
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
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
        <div className="customer-management">
            <header className="page-header">
                <div>
                    <h1>Customer Management</h1>
                    <p>Manage customers and assign them to users</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <FiPlus /> Add New Customer
                </button>
            </header>

            {showForm && (
                <div className="customer-form glass-card">
                    <h2>Add New Customer</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
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
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="input-field"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Assign To User *</label>
                                <select
                                    name="assignedTo"
                                    className="select-field"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select User</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))}
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
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
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
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                Create Customer
                            </button>
                        </div>
                    </form>
                </div>
            )}

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

            <div className="table-container glass-card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <FiUser size={48} color="var(--color-text-tertiary)" />
                                    <p>No customers found</p>
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer._id}>
                                    <td data-label="Customer Name">{customer.customerName}</td>
                                    <td data-label="Phone">
                                        <div className="phone-cell">
                                            <FiPhone size={14} />
                                            {customer.phoneNumber}
                                        </div>
                                    </td>
                                    <td data-label="Email">{customer.email || '-'}</td>
                                    <td data-label="Assigned To">{customer.assignedTo?.username}</td>
                                    <td data-label="Status">
                                        <span className={`badge badge-${customer.status}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td data-label="Priority">
                                        <span className={`priority-badge priority-${customer.priority}`}>
                                            {customer.priority}
                                        </span>
                                    </td>
                                    <td data-label="Actions">
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(customer._id)}
                                            title="Delete Customer"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerManagement;
