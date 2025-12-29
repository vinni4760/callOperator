import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isRegister) {
                result = await register(formData.username, formData.email, formData.password);
            } else {
                result = await login(formData.email, formData.password);
            }

            if (result.success) {
                // Navigation is handled by App.jsx based on user role
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-card glass-card">
                <div className="login-header">
                    <h1>Call Center Management</h1>
                    <p>{isRegister ? 'Create your account' : 'Welcome back'}</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="input-group">
                            <label className="input-label">
                                <FiUser /> Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="input-field"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="input-label">
                            <FiMail /> Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">
                            <FiLock /> Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="input-field password-field"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                setFormData({ username: '', email: '', password: '' });
                            }}
                        >
                            {isRegister ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
