// src/pages/Dashboard.jsx
// Main dashboard with stats, recent animals, and reminders

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, available: 0, adopted: 0, pending: 0, dogs: 0, cats: 0, others: 0 });
  const [recentAnimals, setRecentAnimals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adoptionStats, setAdoptionStats] = useState({ total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all animals for stats
      const animalRes = await api.get('/animals');
      const animals = animalRes.data.animals || [];

      // Calculate stats
      setStats({
        total: animals.length,
        available: animals.filter((a) => a.adoptionStatus === 'available').length,
        adopted: animals.filter((a) => a.adoptionStatus === 'adopted').length,
        pending: animals.filter((a) => a.adoptionStatus === 'pending').length,
        dogs: animals.filter((a) => a.species === 'dog').length,
        cats: animals.filter((a) => a.species === 'cat').length,
        others: animals.filter((a) => a.species !== 'dog' && a.species !== 'cat').length,
      });

      // Recent 6 animals
      setRecentAnimals(animals.slice(0, 6));

      // Fetch adoption stats (admin/staff)
      if (hasRole('admin', 'staff')) {
        const adoptionRes = await api.get('/adoptions');
        const adoptions = adoptionRes.data.adoptions || [];
        setAdoptionStats({
          total: adoptions.length,
          pending: adoptions.filter((a) => a.status === 'pending').length,
        });

        // Fetch vaccination reminders
        const reminderRes = await api.get('/animals/reminders?days=30');
        setReminders(reminderRes.data.reminders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const upcomingVaccinations = reminders.filter((r) => r.urgency === 'urgent' || r.urgency === 'overdue').length;

  return (
    <div className="dashboard-layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🐾</span>
          <span className="sidebar-logo-text">Pawcare</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/animals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🐶</span> Animals
          </NavLink>
          <NavLink to="/vaccinations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">💉</span> Vaccinations
          </NavLink>
          <NavLink to="/adoptions" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">🏠</span> Adoption
          </NavLink>
          {hasRole('admin', 'staff') && (
            <NavLink to="/blockchain" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-link-icon">⚙️</span> Admin Panel
            </NavLink>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
          <button onClick={logout} className="sidebar-logout">
            <span className="sidebar-link-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        {/* Welcome Header */}
        <header className="dashboard-header animate-fade-in">
          <div>
            <h1 className="dashboard-title">Dashboard Overview</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.name?.split(' ')[0]}! Here's what's happening today.</p>
          </div>
          <div className="dashboard-header-actions">
            {hasRole('admin', 'staff') && (
              <Link to="/animals/add" className="btn btn-primary">➕ Add Animal</Link>
            )}
          </div>
        </header>

        {/* Top Summary Cards */}
        <section className="dashboard-summary-cards grid-4 stagger-children">
          <div className="summary-card card-blue animate-fade-up" onClick={() => navigate('/animals')}>
            <div className="summary-card-icon">🐾</div>
            <div className="summary-card-info">
              <h3>Total Animals</h3>
              <div className="summary-card-value">{stats.total}</div>
              <p>In the shelter</p>
            </div>
          </div>
          
          <div className="summary-card card-green animate-fade-up" onClick={() => navigate('/animals?status=available')}>
            <div className="summary-card-icon">✅</div>
            <div className="summary-card-info">
              <h3>Available for Adoption</h3>
              <div className="summary-card-value">{stats.available}</div>
              <p>Ready for homes</p>
            </div>
          </div>
          
          <div className="summary-card card-purple animate-fade-up" onClick={() => navigate('/animals?status=adopted')}>
            <div className="summary-card-icon">🏠</div>
            <div className="summary-card-info">
              <h3>Adopted Animals</h3>
              <div className="summary-card-value">{stats.adopted}</div>
              <p>Successfully placed</p>
            </div>
          </div>
          
          <div className="summary-card card-orange animate-fade-up" onClick={() => navigate('/vaccinations')}>
            <div className="summary-card-icon">⚠️</div>
            <div className="summary-card-info">
              <h3>Vaccination Alerts</h3>
              <div className="summary-card-value">{upcomingVaccinations}</div>
              <p>Urgent / Overdue</p>
            </div>
          </div>
          
          <Link to="/animals?species=dog" className="summary-card card-blue animate-fade-up" style={{ textDecoration: 'none' }}>
            <div className="summary-card-icon">🐶</div>
            <div className="summary-card-info">
              <h3>Dogs Count</h3>
              <div className="summary-card-value">{stats.dogs}</div>
              <p>Total dogs</p>
            </div>
          </Link>

          <Link to="/animals?species=cat" className="summary-card card-green animate-fade-up" style={{ textDecoration: 'none' }}>
            <div className="summary-card-icon">🐱</div>
            <div className="summary-card-info">
              <h3>Cats Count</h3>
              <div className="summary-card-value">{stats.cats}</div>
              <p>Total cats</p>
            </div>
          </Link>

          <Link to="/animals" className="summary-card card-purple animate-fade-up" style={{ textDecoration: 'none' }}>
            <div className="summary-card-icon">🐾</div>
            <div className="summary-card-info">
              <h3>Other Animals</h3>
              <div className="summary-card-value">{stats.others}</div>
              <p>Birds, Rabbits, etc.</p>
            </div>
          </Link>
        </section>

        {/* Two-Column Layout for Recent Animals and Vaccinations */}
        <div className="dashboard-two-column">
          {/* Recent Animals */}
          <section className="dashboard-recent-animals animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="section-header-modern">
              <h2>Recent Animals</h2>
              <Link to="/animals" className="link-view-all">View All</Link>
            </div>
            
            {recentAnimals.length === 0 ? (
              <div className="empty-state-modern">
                <div className="empty-icon">🐾</div>
                <p>No animals added yet.</p>
              </div>
            ) : (
              <div className="recent-animals-list">
                {recentAnimals.map((animal) => (
                  <RecentAnimalRow key={animal._id} animal={animal} />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Vaccinations */}
          {hasRole('admin', 'staff') && (
            <section className="dashboard-upcoming-vaccinations animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="section-header-modern">
                <h2>Upcoming Vaccinations</h2>
              </div>
              
              {reminders.length === 0 ? (
                <div className="empty-state-modern">
                  <div className="empty-icon">💉</div>
                  <p>No upcoming vaccinations.</p>
                </div>
              ) : (
                <div className="vaccination-list">
                  {reminders.slice(0, 5).map((r, i) => (
                    <div key={i} className="vaccination-item">
                      <div className="vaccination-animal">
                        <div className="vaccination-icon">💉</div>
                        <div>
                          <strong>{r.animalName}</strong>
                          <span>{r.vaccinationName}</span>
                        </div>
                      </div>
                      <div className="vaccination-status">
                        <span className={`status-pill ${r.urgency}`}>
                          {r.isOverdue ? `Overdue ${Math.abs(r.daysUntilDue)}d` : `In ${r.daysUntilDue}d`}
                        </span>
                        <div className="vaccination-date">{new Date(r.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

// Row item for recent animals
const RecentAnimalRow = ({ animal }) => {
  const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    // Fallback for old unmigrated images
    return `https://pawcare-y084.onrender.com${img}`;
  };

  return (
    <Link to={`/animals/${animal._id}`} className="recent-animal-row">
      <div className="row-image">
        {animal.image ? (
          <img src={getImageUrl(animal.image)} alt={animal.name} onError={(e) => (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")} />
        ) : (
          <span>{speciesEmoji[animal.species] || '🐾'}</span>
        )}
      </div>
      <div className="row-info">
        <strong>{animal.name}</strong>
        <span>{animal.breed || animal.species}</span>
      </div>
      <div className="row-status">
        <span className={`status-badge ${animal.adoptionStatus}`}>
          {animal.adoptionStatus}
        </span>
      </div>
    </Link>
  );
};

export default Dashboard;
