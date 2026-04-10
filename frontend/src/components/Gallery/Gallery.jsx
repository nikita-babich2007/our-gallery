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
        body: JSON.stringify({ text: editText }),
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
            <div key={photo._id} className="polaroid-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <PolaroidCard 
                image={photo.imageUrl} 
                caption={photo.text || photo.caption} // Подстраховка: база может отдавать text или caption
                onClick={() => setSelectedImage(photo.imageUrl)}
                onDelete={() => setPhotoToDelete(photo._id)}
              />

              {/* Вот тут начинается наша новая магия редактирования */}
              {editingId === photo._id ? (
                <div className="edit-mode" style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                  <input 
                    type="text" 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    placeholder="Новая подпись..."
                    style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
                  />
                  <button onClick={() => handleEditSave(photo._id)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>💾</button>
                  <button onClick={() => setEditingId(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>❌</button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setEditingId(photo._id);
                    setEditText(photo.text || photo.caption || '');
                  }}
                  style={{ marginTop: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#ff9a9e', fontFamily: 'Caveat', fontSize: '1.2rem' }}
                >
                  ✏️ Изменить текст
                </button>
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