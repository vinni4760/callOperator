import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiPhone, FiUsers, FiHome, FiMenu, FiX, FiFileText } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <FiPhone className="brand-icon" />
                    <span>Call Center</span>
                </div>

                <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
                    {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className={`navbar-menu ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    {user?.role === 'admin' ? (
                        <>
                            <button onClick={() => handleNavigate('/admin/dashboard')} className="nav-link">
                                <FiHome /> Dashboard
                            </button>
                            <button onClick={() => handleNavigate('/admin/customers')} className="nav-link">
                                <FiUsers /> Customers
                            </button>
                            <button onClick={() => handleNavigate('/admin/call-records')} className="nav-link">
                                <FiFileText /> Call Records
                            </button>
                            <button onClick={() => handleNavigate('/admin/users')} className="nav-link">
                                <FiUser /> Users
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleNavigate('/user/dashboard')} className="nav-link">
                                <FiHome /> Dashboard
                            </button>
                        </>
                    )}
                </div>

                <div className={`navbar-user ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="user-info">
                        <FiUser />
                        <span>{user?.username}</span>
                        <span className={`role-badge ${user?.role === 'admin' ? 'admin' : 'user'}`}>
                            {user?.role}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        <FiLogOut /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
