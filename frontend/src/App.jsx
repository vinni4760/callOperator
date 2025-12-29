import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerManagement from './components/admin/CustomerManagement';
import CallRecordsView from './components/admin/CallRecordsView';
import UserManagement from './components/admin/UserManagement';
import UserDashboard from './components/user/UserDashboard';
import CallRecordForm from './components/user/CallRecordForm';
import Navbar from './components/Navbar';
import './index.css';

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <Login />
            } />

            {/* Default route - redirect based on role */}
            <Route path="/" element={
                user ? (
                    user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />
                ) : (
                    <Navigate to="/login" replace />
                )
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                    <Navbar />
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/admin/customers" element={
                <ProtectedRoute requiredRole="admin">
                    <Navbar />
                    <CustomerManagement />
                </ProtectedRoute>
            } />

            <Route path="/admin/call-records" element={
                <ProtectedRoute requiredRole="admin">
                    <Navbar />
                    <CallRecordsView />
                </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="admin">
                    <Navbar />
                    <UserManagement />
                </ProtectedRoute>
            } />

            {/* User Routes */}
            <Route path="/user/dashboard" element={
                <ProtectedRoute requiredRole="user">
                    <Navbar />
                    <UserDashboard />
                </ProtectedRoute>
            } />

            <Route path="/user/call-record/:customerId" element={
                <ProtectedRoute requiredRole="user">
                    <Navbar />
                    <CallRecordForm />
                </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
