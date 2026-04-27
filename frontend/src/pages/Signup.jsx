// src/pages/Signup.jsx
// New user registration page

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'adopter',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('All fields are required');
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
    setLoading(false);

    if (result.success) {
      toast.success('Account created! Welcome to Pawcare 🐾');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1"></div>
      <div className="auth-bg-orb auth-bg-orb-2"></div>

      <div className="auth-container animate-fade-up">
        <div className="auth-logo">
          <h1 className="auth-logo-text">Pawcare🐾</h1>
          <p className="auth-logo-subtitle">Join thousands helping animals find homes</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start your journey with Pawcare today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-role">Account Type</label>
              <select
                id="signup-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="adopter">🏠 Adopter — Browse & adopt animals</option>
                <option value="staff">👷 Shelter Staff — Manage animal records</option>
                <option value="admin">⚙️ Admin — Full system access</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18 }}></span> Creating account...</>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
