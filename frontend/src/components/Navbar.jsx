import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiPhone, FiUsers, FiHome } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <FiPhone className="brand-icon" />
                    <span>Call Center</span>
                </div>

                <div className="navbar-menu">
                    {user?.role === 'admin' ? (
                        <>
                            <button onClick={() => navigate('/admin/dashboard')} className="nav-link">
                                <FiHome /> Dashboard
                            </button>
                            <button onClick={() => navigate('/admin/calls')} className="nav-link">
                                <FiPhone /> Calls
                            </button>
                            <button onClick={() => navigate('/admin/users')} className="nav-link">
                                <FiUsers /> Users
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/user/dashboard')} className="nav-link">
                                <FiHome /> Dashboard
                            </button>
                            <button onClick={() => navigate('/user/calls')} className="nav-link">
                                <FiPhone /> My Calls
                            </button>
                        </>
                    )}
                </div>

                <div className="navbar-user">
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
