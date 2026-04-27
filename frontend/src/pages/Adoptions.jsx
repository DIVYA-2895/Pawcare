// src/pages/Adoptions.jsx
// Adoption management page — view requests and approve/reject (admin/staff)

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Adoptions.css';

const Adoptions = () => {
  const { user, hasRole } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null); // Adoption being reviewed
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchAdoptions();
  }, [filter]);

  const fetchAdoptions = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get(`/adoptions${params}`);
      setAdoptions(data.adoptions || []);
    } catch (err) {
      toast.error('Failed to load adoption requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await api.put(`/adoptions/${reviewModal._id}/status`, { status, reviewNotes });
      toast.success(`Application ${status} successfully`);
      setReviewModal(null);
      setReviewNotes('');
      fetchAdoptions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingCount = adoptions.filter((a) => a.status === 'pending').length;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div>
            <h1 className="section-title">
              📋 <span className="text-gradient">
                {hasRole('admin', 'staff') ? 'Adoption Requests' : 'My Applications'}
              </span>
            </h1>
            <p className="section-subtitle">
              {hasRole('admin', 'staff')
                ? `${pendingCount} pending review`
                : `${adoptions.length} application${adoptions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="adoption-filter-tabs">
          {['', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              className={`adoption-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'pending' && pendingCount > 0 && (
                <span className="adoption-tab-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"></div><p>Loading...</p></div>
        ) : adoptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No adoption requests</h3>
            <p>{filter ? `No ${filter} requests found` : 'No applications yet'}</p>
          </div>
        ) : (
          <div className="adoptions-list">
            {adoptions.map((adoption) => (
              <AdoptionCard
                key={adoption._id}
                adoption={adoption}
                isAdmin={hasRole('admin', 'staff')}
                onReview={() => { setReviewModal(adoption); setReviewNotes(''); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Application</h2>
              <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 15, marginBottom: 8 }}>
                <strong>{reviewModal.applicant?.name}</strong> wants to adopt{' '}
                <strong style={{ color: 'var(--color-primary)' }}>{reviewModal.animal?.name}</strong>
              </p>
              {reviewModal.message && (
                <div style={{ padding: 12, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--color-text-muted)' }}>
                  "{reviewModal.message}"
                </div>
              )}
              <div className="review-details-grid" style={{ marginTop: 16 }}>
                <ReviewDetail label="Home Type" value={reviewModal.homeType} />
                <ReviewDetail label="Experience" value={reviewModal.experience} />
                <ReviewDetail label="Has Other Pets" value={reviewModal.hasOtherPets ? 'Yes' : 'No'} />
                <ReviewDetail label="Has Children" value={reviewModal.hasChildren ? 'Yes' : 'No'} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Notes (optional)</label>
              <textarea className="form-textarea" rows={3}
                placeholder="Add a note for the applicant..."
                value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <button className="btn btn-success btn-full" onClick={() => handleReview('approved')} disabled={reviewLoading}>
                {reviewLoading ? '...' : '✅ Approve'}
              </button>
              <button className="btn btn-danger btn-full" onClick={() => handleReview('rejected')} disabled={reviewLoading}>
                {reviewLoading ? '...' : '❌ Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Single adoption request card
const AdoptionCard = ({ adoption, isAdmin, onReview }) => {
  const { animal, applicant, status, message, createdAt, reviewedBy, reviewedAt, reviewNotes, homeType, experience } = adoption;
  const BASE_URL = "https://pawcare-y084.onrender.com";

  // Format the image URL correctly, handling backslashes and ensuring no double slashes
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.png";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div className={`adoption-card animate-fade-up ${status}`}>
      <div className="adoption-card-left">
        {/* Animal image */}
        <div className="adoption-animal-thumb">
          {animal?.image ? (
            <img src={getImageUrl(animal.image)} alt={animal?.name} onError={(e) => (e.target.src = "/placeholder.png")} />
          ) : (
            <span style={{ fontSize: 28 }}>🐾</span>
          )}
        </div>

        <div className="adoption-info">
          <h3 className="adoption-animal-name">{animal?.name || 'Unknown Animal'}</h3>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            {animal?.species} · {animal?.breed}
          </span>

          {isAdmin && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                {applicant?.name?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{applicant?.name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{applicant?.email}</span>
            </div>
          )}

          {message && (
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, fontStyle: 'italic' }}>
              "{message.length > 100 ? message.slice(0, 100) + '...' : message}"
            </p>
          )}

          <div className="flex gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-pending" style={{ background: 'rgba(139,148,158,0.1)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              🏠 {homeType}
            </span>
            <span className="badge badge-pending" style={{ background: 'rgba(139,148,158,0.1)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              🏆 {experience}
            </span>
          </div>
        </div>
      </div>

      <div className="adoption-card-right">
        <div>
          <span className={`badge badge-${status}`}>{status}</span>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
            Applied {new Date(createdAt).toLocaleDateString()}
          </div>
          {reviewedAt && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Reviewed {new Date(reviewedAt).toLocaleDateString()}
              {reviewedBy && ` by ${reviewedBy.name}`}
            </div>
          )}
          {reviewNotes && (
            <div style={{ marginTop: 8, fontSize: 12, padding: '8px 10px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)' }}>
              💬 {reviewNotes}
            </div>
          )}
        </div>

        {isAdmin && status === 'pending' && (
          <button className="btn btn-primary btn-sm" onClick={onReview}>
            Review →
          </button>
        )}
      </div>
    </div>
  );
};

const ReviewDetail = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    <div style={{ fontSize: 13, textTransform: 'capitalize', marginTop: 2 }}>{value}</div>
  </div>
);

export default Adoptions;
