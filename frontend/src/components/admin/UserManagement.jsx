import { useState, useEffect } from 'react';
import { FiUsers, FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
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
            await api.post('/admin/users', formData);
            setFormData({ username: '', email: '', password: '', role: 'user' });
            setShowForm(false);
            fetchUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error.response?.data?.message || 'Failed to create user');
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
        <div className="user-management">
            <header className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users and their roles</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <FiPlus /> Add New User
                </button>
            </header>

            {showForm && (
                <div className="user-form glass-card">
                    <h2>Add New User</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="input-field"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input-field"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Role *</label>
                                <select
                                    name="role"
                                    className="select-field"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-success">
                                Create User
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="users-grid">
                {users.length === 0 ? (
                    <div className="empty-state glass-card">
                        <FiUsers size={48} color="var(--color-text-tertiary)" />
                        <p>No users found</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user._id} className="user-card glass-card">
                            <div className="user-avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <h3>{user.username}</h3>
                                <p>{user.email}</p>
                                <span className={`badge ${user.role === 'admin' ? 'badge-in-review' : 'badge-completed'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="user-meta">
                                <small>Joined {new Date(user.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserManagement;
