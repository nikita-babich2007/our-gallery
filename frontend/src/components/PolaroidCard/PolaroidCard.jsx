import React from 'react';
import './PolaroidCard.css';

const PolaroidCard = ({ image, caption, onClick, onDelete }) => {
  return (
    <div className="polaroid-card" onClick={onClick}>
      <div className="image-container">
        <img src={image} alt={caption} className="polaroid-image" />
      </div>
      {caption && <div className="polaroid-caption">{caption}</div>}
    </div>
  );
};

export default PolaroidCard;