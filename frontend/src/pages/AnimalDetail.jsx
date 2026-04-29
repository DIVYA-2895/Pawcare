// src/pages/AnimalDetail.jsx
// Detailed view of a single animal — vaccination history, adoption apply button

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AnimalDetail.css';

const formatAge = (age) => age ? `${age.value} ${age.unit}` : 'Unknown';
const speciesEmoji = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇', other: '🐾' };

const AnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptForm, setAdoptForm] = useState({
    message: '', homeType: 'apartment', hasOtherPets: false,
    hasChildren: false, experience: 'first-time',
  });
  const [adoptLoading, setAdoptLoading] = useState(false);

  useEffect(() => {
    fetchAnimal();
  }, [id]);

  const fetchAnimal = async () => {
    try {
      const { data } = await api.get(`/animals/${id}`);
      setAnimal(data.animal);
    } catch (err) {
      toast.error('Animal not found');
      navigate('/animals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${animal.name}?`)) return;
    try {
      await api.delete(`/animals/${id}`);
      toast.success(`${animal.name} has been removed`);
      navigate('/animals');
    } catch (err) {
      toast.error('Failed to delete animal');
    }
  };

  const handleAdoptSubmit = async (e) => {
    e.preventDefault();
    setAdoptLoading(true);
    try {
      await api.post('/adoptions', { animalId: id, ...adoptForm });
      toast.success('🐾 Adoption application submitted!');
      setShowAdoptModal(false);
      fetchAnimal(); // Refresh status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setAdoptLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper"><div className="container loading-page"><div className="spinner"></div><p>Loading...</p></div></div>;
  if (!animal) return null;

  // Helper: get full image URL
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    // Fallback for old unmigrated images
    return `https://pawcare-y084.onrender.com${img}`;
  };

  const fallbackImage = "https://via.placeholder.com/400/300?text=PawCare";

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back link */}
        <Link to="/animals" className="back-link">← Back to Animals</Link>

        <div className="animal-detail-grid">
          {/* Left — Image and basic info */}
          <div>
            <div className="animal-detail-image-card card">
              {animal.image ? (
                <img 
                  src={getImageUrl(animal.image)} 
                  alt={animal.name} 
                  className="animal-detail-image" 
                  onError={(e) => {
                    if (e.target.src !== fallbackImage) {
                      e.target.src = fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="animal-detail-no-image">
                  <span>{speciesEmoji[animal.species] || '🐾'}</span>
                </div>
              )}
              <div className="animal-detail-image-overlay">
                <span className={`badge badge-${animal.adoptionStatus}`}>{animal.adoptionStatus}</span>
                <span className={`badge badge-${animal.healthStatus}`}>{animal.healthStatus}</span>
              </div>
            </div>

            {/* Blockchain info */}
            {animal.blockchainHash && (
              <div className="card blockchain-hash-card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span>🔗</span>
                  <strong style={{ fontSize: 13 }}>Blockchain Verified</strong>
                </div>
                <code style={{ fontSize: 10, color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                  {animal.blockchainHash}
                </code>
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    {animal.name}
                  </h1>
                  <div style={{ fontSize: 16, color: 'var(--color-text-muted)', textTransform: 'capitalize', marginTop: 4 }}>
                    {speciesEmoji[animal.species]} {animal.species} · {animal.breed}
                  </div>
                </div>
                {/* Admin/Staff actions */}
                {hasRole('admin', 'staff') && (
                  <div className="flex gap-2">
                    <Link to={`/animals/edit/${id}`} className="btn btn-secondary">✏️ Edit</Link>
                    <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="detail-info-grid">
                <DetailItem label="Age" value={formatAge(animal.age)} />
                <DetailItem label="Gender" value={animal.gender} />
                <DetailItem label="Color" value={animal.color || 'Not specified'} />
                <DetailItem label="Weight" value={animal.weight ? `${animal.weight} kg` : 'Unknown'} />
                <DetailItem label="Rescue Date" value={new Date(animal.rescueDate).toLocaleDateString()} />
                <DetailItem label="Rescue Location" value={animal.rescueLocation || 'Unknown'} />
                <DetailItem label="Rescued By" value={animal.rescuedBy || 'Unknown'} />
                <DetailItem label="Added By" value={animal.addedBy?.name || 'Unknown'} />
              </div>

              {animal.description && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>About</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--color-text)' }}>{animal.description}</p>
                </div>
              )}

              {animal.medicalNotes && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-warning)' }}>
                  <strong style={{ fontSize: 13 }}>📋 Medical Notes:</strong>
                  <p style={{ fontSize: 13, marginTop: 4, color: 'var(--color-text-muted)' }}>{animal.medicalNotes}</p>
                </div>
              )}
            </div>

            {/* Vaccination History */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>💉 Vaccination History</h2>
              {animal.vaccinations?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No vaccination records</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Vaccine</th>
                        <th>Date Given</th>
                        <th>Next Due</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animal.vaccinations.map((v, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{v.name}</td>
                          <td>{new Date(v.date).toLocaleDateString()}</td>
                          <td>{v.nextDue ? new Date(v.nextDue).toLocaleDateString() : '—'}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{v.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Adoption Button */}
            {animal.adoptionStatus === 'available' && user?.role === 'adopter' && (
              <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowAdoptModal(true)}>
                🏠 Apply to Adopt {animal.name}
              </button>
            )}

            {animal.adoptionStatus === 'pending' && (
              <div style={{ padding: 16, background: 'rgba(255, 165, 2, 0.1)', border: '1px solid rgba(255, 165, 2, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-warning)' }}>⏳ Adoption Pending</strong>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>This animal's adoption is currently under review.</p>
              </div>
            )}

            {animal.adoptionStatus === 'adopted' && (
              <div style={{ padding: 16, background: 'rgba(124, 111, 205, 0.1)', border: '1px solid rgba(124, 111, 205, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-secondary)' }}>🏠 Already Adopted</strong>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>This animal has found its forever home!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      {showAdoptModal && (
        <div className="modal-overlay" onClick={() => setShowAdoptModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏠 Adopt {animal.name}</h2>
              <button className="modal-close" onClick={() => setShowAdoptModal(false)}>×</button>
            </div>

            <form onSubmit={handleAdoptSubmit}>
              <div className="form-group">
                <label className="form-label">Why do you want to adopt {animal.name}?</label>
                <textarea className="form-textarea" placeholder="Tell us about yourself and your home..."
                  value={adoptForm.message} onChange={(e) => setAdoptForm((p) => ({ ...p, message: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Home Type</label>
                <select className="form-select" value={adoptForm.homeType}
                  onChange={(e) => setAdoptForm((p) => ({ ...p, homeType: e.target.value }))}>
                  <option value="apartment">Apartment</option>
                  <option value="house-small-yard">House with small yard</option>
                  <option value="house-large-yard">House with large yard</option>
                  <option value="farm">Farm</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Experience with Pets</label>
                <select className="form-select" value={adoptForm.experience}
                  onChange={(e) => setAdoptForm((p) => ({ ...p, experience: e.target.value }))}>
                  <option value="first-time">First-time owner</option>
                  <option value="some-experience">Some experience</option>
                  <option value="experienced">Experienced owner</option>
                </select>
              </div>

              <div className="flex gap-4" style={{ marginBottom: 20 }}>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={adoptForm.hasOtherPets}
                    onChange={(e) => setAdoptForm((p) => ({ ...p, hasOtherPets: e.target.checked }))} />
                  <span style={{ fontSize: 14 }}>I have other pets</span>
                </label>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={adoptForm.hasChildren}
                    onChange={(e) => setAdoptForm((p) => ({ ...p, hasChildren: e.target.checked }))} />
                  <span style={{ fontSize: 14 }}>I have children</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={adoptLoading}>
                {adoptLoading ? 'Submitting...' : '🐾 Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-item-label">{label}</span>
    <span className="detail-item-value" style={{ textTransform: 'capitalize' }}>{value}</span>
  </div>
);

export default AnimalDetail;
