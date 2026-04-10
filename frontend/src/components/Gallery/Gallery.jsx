import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import PolaroidCard from '../PolaroidCard/PolaroidCard';
import Modal from '../Modal/Modal';
import './Gallery.css';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null); // Храним ID фото, которое хотим удалить

  useEffect(() => {
    fetch('http://localhost:5000/api/photos')
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error('Ошибка загрузки фото:', err));
  }, []);

  // Эта функция реально удаляет фотку после подтверждения
  const executeDelete = async () => {
    if (!photoToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/photos/${photoToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo._id !== photoToDelete));
        setPhotoToDelete(null); // Закрываем окошко
      } else {
        alert('Упс, не удалось удалить фото...');
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  const breakpointColumnsObj = { default: 4, 1200: 3, 992: 3, 768: 2, 500: 1 };

  return (
    <div className="gallery-container">
      {photos.length === 0 ? (
        <h2 style={{ textAlign: 'center', fontFamily: 'Caveat', color: '#ff9a9e' }}>
          Тут пока пусто... Добавь наше первое воспоминание! ❤️
        </h2>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {photos.map((photo) => (
            <PolaroidCard 
              key={photo._id} 
              image={photo.imageUrl} 
              caption={photo.caption} 
              onClick={() => setSelectedImage(photo.imageUrl)}
              onDelete={() => setPhotoToDelete(photo._id)} // Теперь просто открываем модалку подтверждения
            />
          ))}
        </Masonry>
      )}

      {selectedImage && (
        <Modal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* КАСТОМНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ */}
      {photoToDelete && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>Точно хочешь удалить это воспоминание? 💔</p>
            <div className="confirm-buttons">
              <button className="btn-no" onClick={() => setPhotoToDelete(null)}>Оставить</button>
              <button className="btn-yes" onClick={executeDelete}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;