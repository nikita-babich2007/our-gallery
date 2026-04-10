import React from 'react';
import './PolaroidCard.css';

// Принимаем новый пропс onDelete
const PolaroidCard = ({ image, caption, onClick, onDelete }) => {
  return (
    <div className="polaroid-card" onClick={onClick}>
      
      {/* КНОПКА УДАЛЕНИЯ */}
      <button 
        className="delete-btn" 
        onClick={(e) => {
          e.stopPropagation(); // ВАЖНО: не дает открыться модалке при клике на крестик
          onDelete();
        }}
        title="Удалить фото"
      >
        ×
      </button>

      <div className="image-container">
        <img src={image} alt={caption} className="polaroid-image" />
      </div>
      {caption && <div className="polaroid-caption">{caption}</div>}
    </div>
  );
};

export default PolaroidCard;