import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import PolaroidCard from '../PolaroidCard/PolaroidCard';
import Modal from '../Modal/Modal';
import './Gallery.css';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetch('https://our-gallery-backend.onrender.com/api/photos')
      .then((res) => res.json())
      .then((data) => setPhotos(data))
      .catch((err) => console.error('Ошибка загрузки фото:', err));
  }, []);

  const executeDelete = async () => {
    if (!photoToDelete) return;

    try {
      const response = await fetch(`https://our-gallery-backend.onrender.com/api/photos/${photoToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo._id !== photoToDelete));
        setPhotoToDelete(null);
      } else {
        alert('Упс, не удалось удалить фото...');
      }
    } catch (err) {
      console.error('Ошибка при удалении:', err);
    }
  };

  const handleEditSave = async (id) => {
    try {
      const response = await fetch(`https://our-gallery-backend.onrender.com/api/photos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // ИЗМЕНИЛИ text на caption вот здесь:
        body: JSON.stringify({ caption: editText }),
      });

      if (response.ok) {
        const updatedPhoto = await response.json();
        setPhotos(photos.map(photo => photo._id === id ? updatedPhoto : photo));
        setEditingId(null);
      }
    } catch (error) {
      console.error('Ошибка обновления:', error);
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
            // ИСПОЛЬЗУЕМ НОВЫЙ CSS-КЛАСС
            <div key={photo._id} className="polaroid-wrapper">
              
              <PolaroidCard 
                image={photo.imageUrl} 
                caption={photo.text || photo.caption} 
                onClick={() => setSelectedImage(photo.imageUrl)}
                // onDelete УБРАЛИ ОТСЮДА! Мы управляем удалением снаружи
              />

              {/* Вот наш новый контейнер с иконками, который виден только на ховере */}
              <div className="polaroid-actions">
                <button 
                  className="action-icon-btn edit-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // <--- ВОТ ЭТО
                    setEditingId(photo._id);
                    setEditText(photo.caption || photo.text || '');
                  }}
                  title="Изменить текст"
                >
                  ✏️
                </button>

                <button 
                  className="action-icon-btn delete-icon"
                  onClick={(e) => {
                    e.stopPropagation(); // <--- И ВОТ ЭТО
                    setPhotoToDelete(photo._id);
                  }}
                  title="Удалить воспоминание"
                >
                  ❌
                </button>
              </div>

              {/* Режим редактирования появляется под карточкой */}
              {editingId === photo._id && (
                <div className="edit-mode-container">
                  <input 
                    type="text" 
                    className="edit-input"
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    placeholder="Новая подпись..."
                  />
                  <div className="edit-buttons">
                    <button className="btn-save" onClick={() => handleEditSave(photo._id)}>💾 Сохранить</button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>Отмена</button>
                  </div>
                </div>
              )}
              
            </div>
          ))}
        </Masonry>
      )}

      {selectedImage && (
        <Modal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

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