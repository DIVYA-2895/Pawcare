// src/components/AnimalCard.jsx
// Card component for displaying an animal in the listing page

import { Link } from 'react-router-dom';
import './AnimalCard.css';

// Helper: convert age to readable string
const formatAge = (age) => {
  if (!age) return 'Unknown';
  return `${age.value} ${age.unit}`;
};

// Helper: get emoji for species
const speciesEmoji = {
  dog: '🐕',
  cat: '🐈',
  bird: '🦜',
  rabbit: '🐇',
  other: '🐾',
};

const AnimalCard = ({ animal }) => {
  const {
    _id, name, species, breed, age, gender, adoptionStatus,
    healthStatus, image, description,
  } = animal;

  // Helper: get full image URL
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    // Backend now stores path starting with /uploads/
    return `http://localhost:5000${img}`;
  };

  const fallbackImage = "https://via.placeholder.com/400/300?text=PawCare";

  return (
    <div className="animal-card animate-fade-up">
      {/* Image Section */}
      <div className="animal-card-image">
        {image ? (
          <img 
            src={getImageUrl(image)} 
            alt={name} 
            loading="lazy" 
            onError={(e) => {
              if (e.target.src !== fallbackImage) {
                e.target.src = fallbackImage;
              }
            }} 
          />
        ) : (
          <div className="animal-card-no-image">
            <span>{speciesEmoji[species] || '🐾'}</span>
          </div>
        )}
        
        {/* Status badge overlay */}
        <div className="animal-card-status">
          <span className={`badge badge-${adoptionStatus}`}>
            {adoptionStatus}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="animal-card-body">
        <div className="animal-card-header">
          <h3 className="animal-card-name">{name}</h3>
          <span className="animal-card-species">{speciesEmoji[species]} {species}</span>
        </div>

        <div className="animal-card-details">
          <div className="animal-card-detail">
            <span className="detail-label">Breed</span>
            <span className="detail-value">{breed || 'Unknown'}</span>
          </div>
          <div className="animal-card-detail">
            <span className="detail-label">Age</span>
            <span className="detail-value">{formatAge(age)}</span>
          </div>
          <div className="animal-card-detail">
            <span className="detail-label">Gender</span>
            <span className="detail-value">{gender || 'Unknown'}</span>
          </div>
          <div className="animal-card-detail">
            <span className="detail-label">Health</span>
            <span className={`badge badge-${healthStatus}`}>{healthStatus}</span>
          </div>
        </div>

        {description && (
          <p className="animal-card-desc">
            {description.length > 80 ? description.slice(0, 80) + '...' : description}
          </p>
        )}

        <Link to={`/animals/${_id}`} className="btn btn-primary btn-full" style={{ marginTop: 16 }}>
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default AnimalCard;
