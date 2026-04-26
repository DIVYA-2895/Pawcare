// src/pages/Animals.jsx
// Animal listing page with search, filter, and AI recommendations

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimalCard from '../components/AnimalCard';
import toast from 'react-hot-toast';
import './Animals.css';

const Animals = () => {
  const { user, hasRole } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // AI Recommendation state
  const [showAI, setShowAI] = useState(false);
  const [aiPrefs, setAiPrefs] = useState({ species: '', ageRange: '', experience: 'first-time' });
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const species = params.get('species');
    if (species) {
      setFilterSpecies(species);
    } else {
      setFilterSpecies('');
    }
  }, [location.search]);

  useEffect(() => {
    fetchAnimals();
  }, [search, filterSpecies, filterStatus]);

  const fetchAnimals = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterSpecies) params.append('species', filterSpecies);
      if (filterStatus) params.append('status', filterStatus);

      const { data } = await api.get(`/animals?${params}`);
      setAnimals(data.animals || []);
    } catch (err) {
      toast.error('Failed to load animals');
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data } = await api.post('/animals/recommend', { preferences: aiPrefs });
      setRecommendations(data.recommendations || []);
      toast.success(`Found ${data.recommendations.length} matches for you!`);
    } catch (err) {
      toast.error('AI recommendation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <div className="page-title-bar" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
            <h1 className="section-title">
              🐾 <span className="text-gradient">All Animals</span>
            </h1>
            <p className="section-subtitle">{animals.length} animal{animals.length !== 1 ? 's' : ''} in our care</p>
          </div>
          <div className="flex gap-3">
            <button
              className={`btn ${showAI ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowAI(!showAI)}
            >
              🤖 AI Match
            </button>
            {hasRole('admin', 'staff') && (
              <Link to="/animals/add" className="btn btn-primary">➕ Add Animal</Link>
            )}
          </div>
        </div>

        {/* AI Recommendation Panel */}
        {showAI && (
          <div className="ai-panel card animate-fade-up" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 <span className="text-gradient">AI Animal Matcher</span>
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20 }}>
              Tell us your preferences and we'll find your perfect match!
            </p>
            <div className="grid-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Preferred Animal</label>
                <select className="form-select" value={aiPrefs.species}
                  onChange={(e) => setAiPrefs((p) => ({ ...p, species: e.target.value }))}>
                  <option value="">Any animal</option>
                  <option value="dog">🐕 Dog</option>
                  <option value="cat">🐈 Cat</option>
                  <option value="bird">🦜 Bird</option>
                  <option value="rabbit">🐇 Rabbit</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Age Preference</label>
                <select className="form-select" value={aiPrefs.ageRange}
                  onChange={(e) => setAiPrefs((p) => ({ ...p, ageRange: e.target.value }))}>
                  <option value="">Any age</option>
                  <option value="baby">Baby (0-6 months)</option>
                  <option value="young">Young (6m - 2yr)</option>
                  <option value="adult">Adult (2-7 yr)</option>
                  <option value="senior">Senior (7+ yr)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Your Experience</label>
                <select className="form-select" value={aiPrefs.experience}
                  onChange={(e) => setAiPrefs((p) => ({ ...p, experience: e.target.value }))}>
                  <option value="first-time">First-time owner</option>
                  <option value="some-experience">Some experience</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={getAIRecommendations} disabled={aiLoading}>
              {aiLoading ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Finding matches...</> : '✨ Find My Match'}
            </button>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 16 }}>Your Top Matches:</h4>
                <div className="grid-4">
                  {recommendations.slice(0, 6).map(({ animal, matchPercentage, reasons }) => (
                    <div key={animal._id} className="rec-card">
                      <div className="rec-match-badge">{matchPercentage}% match</div>
                      <strong>{animal.name}</strong>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 13, textTransform: 'capitalize' }}>
                        {animal.species} · {animal.breed}
                      </span>
                      <ul style={{ marginTop: 8 }}>
                        {reasons.slice(0, 2).map((r, i) => (
                          <li key={i} style={{ fontSize: 11, color: 'var(--color-primary)', marginBottom: 2 }}>✓ {r}</li>
                        ))}
                      </ul>
                      <Link to={`/animals/${animal._id}`} className="btn btn-primary btn-sm btn-full" style={{ marginTop: 10 }}>
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-bar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search by name or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="form-select" value={filterSpecies} onChange={(e) => {
            setFilterSpecies(e.target.value);
            // Optionally update URL if they manually change select
            navigate(e.target.value ? `/animals?species=${e.target.value}` : '/animals');
          }}>
            <option value="">All Species</option>
            <option value="dog">🐕 Dogs</option>
            <option value="cat">🐈 Cats</option>
            <option value="bird">🦜 Birds</option>
            <option value="rabbit">🐇 Rabbits</option>
            <option value="other">🐾 Other</option>
          </select>
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="adopted">Adopted</option>
          </select>
          <button className="btn btn-secondary" onClick={() => {
            setSearch('');
            setFilterSpecies('');
            setFilterStatus('');
            navigate('/animals');
          }}>Show All</button>
        </div>

        {/* Animal Grid */}
        {loading ? (
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading animals...</p>
          </div>
        ) : animals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No animals found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="animals-grid stagger-children">
            {animals.map((animal) => (
              <AnimalCard key={animal._id} animal={animal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Animals;
