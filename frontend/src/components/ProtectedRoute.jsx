// src/components/ProtectedRoute.jsx
// Prevents unauthenticated users from accessing protected pages

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Usage: <Route element={<ProtectedRoute roles={['admin', 'staff']} />}>
 * 
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to /dashboard
 * - Otherwise → render the child element
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction — if roles specified, check user's role
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
