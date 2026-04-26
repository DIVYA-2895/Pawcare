// src/pages/EditAnimal.jsx
// Form to edit an existing animal record (Staff/Admin only)

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './AddAnimal.css'; // Reusing AddAnimal styles

const EditAnimal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    ageValue: '',
    ageUnit: 'years',
    gender: 'unknown',
    color: '',
    description: '',
    rescueDate: new Date().toISOString().split('T')[0],
    rescueLocation: '',
    rescuedBy: '',
    healthStatus: 'healthy',
    weight: '',
    medicalNotes: '',
    image: null,
  });

  const [vaccinations, setVaccinations] = useState([]);
  const [newVaccine, setNewVaccine] = useState({ name: '', date: '', nextDue: '', notes: '' });

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const { data } = await api.get(`/animals/${id}`);
        const animal = data.animal;
        
        // Populate form data
        setFormData({
          name: animal.name || '',
          species: animal.species || 'dog',
          breed: animal.breed || '',
          ageValue: animal.age?.value || '',
          ageUnit: animal.age?.unit || 'years',
          gender: animal.gender || 'unknown',
          color: animal.color || '',
          description: animal.description || '',
          rescueDate: animal.rescueDate ? new Date(animal.rescueDate).toISOString().split('T')[0] : '',
          rescueLocation: animal.rescueLocation || '',
          rescuedBy: animal.rescuedBy || '',
          healthStatus: animal.healthStatus || 'healthy',
          weight: animal.weight || '',
          medicalNotes: animal.medicalNotes || '',
          image: null, // Keep null unless user uploads a new one
        });
        
        if (animal.vaccinations) {
          setVaccinations(animal.vaccinations);
        }
        
        if (animal.image) {
          setExistingImage(animal.image);
          // Check if it's a full URL or upload path
          if (animal.image.startsWith('http')) {
            setImagePreview(animal.image);
          } else {
            setImagePreview(`http://localhost:5000${animal.image}`);
          }
        }
      } catch (err) {
        toast.error('Failed to fetch animal data');
        navigate('/animals');
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchAnimal();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addVaccination = () => {
    if (!newVaccine.name || !newVaccine.date) {
      return toast.error('Vaccine name and date are required');
    }
    setVaccinations((prev) => [...prev, { ...newVaccine }]);
    setNewVaccine({ name: '', date: '', nextDue: '', notes: '' });
    toast.success('Vaccination added');
  };

  const removeVaccination = (index) => {
    setVaccinations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.species) {
      return toast.error('Animal name and species are required');
    }

    if (!formData.ageValue || isNaN(formData.ageValue)) {
      return toast.error('Please enter a valid age');
    }

    setLoading(true);

    try {
      const payload = new FormData();
      
      // Append all fields except image and vaccinations
      Object.entries(formData).forEach(([key, val]) => {
        if (key !== 'image' && val !== null && val !== undefined) {
          payload.append(key, val);
        }
      });

      // Append image ONLY if it's a new file (File object)
      if (formData.image instanceof File) {
        payload.append('image', formData.image);
      } else {
        // If no new image, send the existing image filename/URL as a string
        // The backend logic I added will handle this by keeping the old one
        if (existingImage) {
          payload.append('image', existingImage);
        }
      }
      
      if (vaccinations.length > 0) {
        payload.append('vaccinations', JSON.stringify(vaccinations));
      }

      await api.put(`/animals/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`${formData.name} updated successfully!`);
      // Removed automatic redirects to dashboard
      navigate(`/animals/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update animal');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="page-wrapper">
        <div className="container loading-page">
          <div className="spinner"></div>
          <p>Loading animal data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-title-bar" style={{ marginBottom: 32 }}>
          <h1 className="section-title">✏️ <span className="text-gradient">Edit Animal</span></h1>
          <p className="section-subtitle">Update information for {formData.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="add-animal-form">
          <div className="grid-2">

            {/* Left Column */}
            <div>
              {/* Basic Info Card */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="form-section-title">🐾 Basic Information</h3>

                <div className="form-group">
                  <label className="form-label">Animal Name *</label>
                  <input name="name" type="text" className="form-input" placeholder="e.g., Max, Luna"
                    value={formData.name} onChange={handleChange} required />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Species *</label>
                    <select name="species" className="form-select" value={formData.species} onChange={handleChange}>
                      <option value="dog">🐕 Dog</option>
                      <option value="cat">🐈 Cat</option>
                      <option value="bird">🦜 Bird</option>
                      <option value="rabbit">🐇 Rabbit</option>
                      <option value="other">🐾 Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Breed</label>
                    <input name="breed" type="text" className="form-input" placeholder="e.g., Labrador"
                      value={formData.breed} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input name="ageValue" type="number" className="form-input" placeholder="e.g., 2"
                        value={formData.ageValue} onChange={handleChange} min="0" step="0.5" required />
                      <select name="ageUnit" className="form-select" style={{ width: 120 }}
                        value={formData.ageUnit} onChange={handleChange}>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input name="color" type="text" className="form-input" placeholder="e.g., Brown"
                      value={formData.color} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input name="weight" type="number" className="form-input" placeholder="e.g., 12.5"
                      value={formData.weight} onChange={handleChange} min="0" step="0.1" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea"
                    placeholder="Tell us about this animal's personality, story..."
                    value={formData.description} onChange={handleChange} />
                </div>
              </div>

              {/* Rescue Info Card */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="form-section-title">🚨 Rescue Information</h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Rescue Date</label>
                    <input name="rescueDate" type="date" className="form-input"
                      value={formData.rescueDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Health Status</label>
                    <select name="healthStatus" className="form-select" value={formData.healthStatus} onChange={handleChange}>
                      <option value="healthy">✅ Healthy</option>
                      <option value="recovering">🔄 Recovering</option>
                      <option value="under-treatment">💊 Under Treatment</option>
                      <option value="critical">⚠️ Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rescue Location</label>
                  <input name="rescueLocation" type="text" className="form-input" placeholder="e.g., Downtown Park"
                    value={formData.rescueLocation} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Rescued By</label>
                  <input name="rescuedBy" type="text" className="form-input" placeholder="Rescue team or person name"
                    value={formData.rescuedBy} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Notes</label>
                  <textarea name="medicalNotes" className="form-textarea" rows={3}
                    placeholder="Any medical conditions, allergies, treatments..."
                    value={formData.medicalNotes} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Image Upload */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="form-section-title">📷 Animal Photo</h3>
                <div className="image-upload-area" onClick={() => document.getElementById('image-input').click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="image-preview" onError={(e) => (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")} />
                  ) : (
                    <div className="image-upload-placeholder">
                      <span style={{ fontSize: 48 }}>📷</span>
                      <p>Click to upload photo</p>
                      <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>JPG, PNG, WEBP (max 5MB)</span>
                    </div>
                  )}
                  <input id="image-input" type="file" name="image" accept="image/*"
                    onChange={handleChange} style={{ display: 'none' }} />
                </div>
              </div>

              {/* Vaccinations */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="form-section-title">💉 Vaccination Records</h3>

                {/* Add new vaccination */}
                <div className="grid-2" style={{ marginBottom: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Vaccine Name</label>
                    <input type="text" className="form-input" placeholder="e.g., Rabies"
                      value={newVaccine.name} onChange={(e) => setNewVaccine((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Given</label>
                    <input type="date" className="form-input"
                      value={newVaccine.date} onChange={(e) => setNewVaccine((p) => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Next Due Date</label>
                    <input type="date" className="form-input"
                      value={newVaccine.nextDue} onChange={(e) => setNewVaccine((p) => ({ ...p, nextDue: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <input type="text" className="form-input" placeholder="Optional"
                      value={newVaccine.notes} onChange={(e) => setNewVaccine((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addVaccination}>
                  + Add Vaccination
                </button>

                {/* List of added vaccinations */}
                {vaccinations.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {vaccinations.map((v, i) => (
                      <div key={i} className="vaccine-tag">
                        <span>💉 {v.name} — {v.date ? new Date(v.date).toLocaleDateString() : 'Unknown'}</span>
                        <button type="button" onClick={() => removeVaccination(i)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 700, marginLeft: 8 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="add-animal-footer">
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(`/animals/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18 }}></span> Updating...</>
              ) : (
                '🐾 Update Animal Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnimal;
