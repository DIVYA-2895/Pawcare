// src/components/Navbar.jsx
// Top navigation bar with role-based links and user info

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Get user initials for avatar
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/dashboard" className="navbar-logo">
          <span className="navbar-logo-icon">🐾</span>
          <span className="navbar-logo-text">Pawcare</span>
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <span className="navbar-link-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink to="/animals" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <span className="navbar-link-icon">🐶</span>
            Animals
          </NavLink>

          {/* Only staff/admin can add animals */}
          {hasRole('admin', 'staff') && (
            <NavLink to="/animals/add" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span className="navbar-link-icon">➕</span>
              Add Animal
            </NavLink>
          )}

          <NavLink to="/adoptions" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <span className="navbar-link-icon">🏠</span>
            Adoptions
          </NavLink>

          {/* Blockchain ledger — admin/staff only */}
          {hasRole('admin', 'staff') && (
            <NavLink to="/blockchain" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              <span className="navbar-link-icon">🔗</span>
              Blockchain
            </NavLink>
          )}
        </div>

        {/* Right side — user info + logout */}
        <div className="navbar-right">
          {user && (
            <div className="navbar-user">
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                {initials}
              </div>
              <span className="navbar-user-name">{user.name}</span>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </div>
          )}

          <button className="navbar-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
