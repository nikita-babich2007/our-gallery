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
  const [isLoading, setIsLoading] = useState(true); 
  const [page, setPage] = useState(1);             
  const [hasMore, setHasMore] = useState(true); 
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Функция для скачивания конкретной страницы
  const fetchPhotos = async () => {
    try {
      if (page > 1) setIsFetchingMore(true);

      const res = await fetch(`https://our-gallery-backend.onrender.com/api/photos?page=${page}&limit=12`);
      const data = await res.json();

      const newPhotos = data.photos || []; 
      setPhotos(prev => page === 1 ? newPhotos : [...prev, ...newPhotos]);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100
      ) {
        if (!isFetchingMore && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetchingMore, hasMore]);

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

  const breakpointColumnsObj = { default: 4, 1200: 3, 992: 3, 768: 2, 500: 2 };

  return (
    <div className="gallery-container">
      {isLoading ? (
        <div className="loader-container">
          <div className="heart-loader">❤️</div>
          <p>Вспоминаем наши моменты...</p>
        </div>
      ) : photos.length === 0 ? (
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
            <div key={photo._id} className="polaroid-wrapper">
              
              <PolaroidCard 
                image={photo.imageUrl} 
                caption={photo.text || photo.caption} 
                onClick={() => setSelectedImage(photo.imageUrl)}
              />

              <div className="polaroid-actions">
                <button 
                  className="action-icon-btn edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(photo._id);
                    setEditText(photo.text || photo.caption || '');

                    setTimeout(() => {
                      const editBox = document.getElementById(`edit-container-${photo._id}`);
                      if (editBox) {
                        editBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  title="Изменить текст"
                >
                  ✏️
                </button>

                <button 
                  className="action-icon-btn delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoToDelete(photo._id);
                  }}
                  title="Удалить воспоминание"
                >
                  ❌
                </button>
              </div>

              {editingId === photo._id && (
                <div className="edit-mode-container" id={`edit-container-${photo._id}`}>
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

      {isFetchingMore && (
        <div style={{ textAlign: 'center', margin: '20px 0', fontFamily: 'Caveat', color: '#ff9a9e', fontSize: '1.5rem' }}>
          Подгружаем воспоминания... ✨
        </div>
      )}
    </div>
  );
};

export default Gallery;