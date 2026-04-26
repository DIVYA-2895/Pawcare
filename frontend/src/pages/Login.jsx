// src/pages/Login.jsx
// Login page with animated form

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back! 🐾');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  // Quick fill for demo
  const fillDemo = (role) => {
    const demos = {
      admin: { email: 'admin@pawcare.com', password: 'admin123' },
      staff: { email: 'staff@pawcare.com', password: 'staff123' },
      adopter: { email: 'adopter@pawcare.com', password: 'adopter123' },
    };
    setFormData(demos[role]);
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>

      <div className="auth-container animate-fade-up">
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🐾</span>
          <h1 className="auth-logo-text">Pawcare</h1>
          <p className="auth-logo-subtitle">Digital Animal Record & Adoption System</p>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18 }}></span> Signing in...</>
              ) : (
                '🔓 Sign In'
              )}
            </button>
          </form>

          {/* Demo Quick Fill */}
          <div className="auth-demo">
            <p className="auth-demo-label">Quick Demo Login:</p>
            <div className="auth-demo-buttons">
              <button className="auth-demo-btn" onClick={() => fillDemo('admin')}>Admin</button>
              <button className="auth-demo-btn" onClick={() => fillDemo('staff')}>Staff</button>
              <button className="auth-demo-btn" onClick={() => fillDemo('adopter')}>Adopter</button>
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
