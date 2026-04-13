import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import './UploadButton.css';

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file)); 

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        console.log(`Было: ${(file.size / 1024 / 1024).toFixed(2)} МБ. Стало: ${(compressedFile.size / 1024 / 1024).toFixed(2)} МБ`);
        setImageFile(compressedFile);
      } catch (error) {
        console.error('Ошибка при сжатии:', error);
        setImageFile(file);
      }
    }
  };

  const handleSave = async () => {
    if (!imageFile) {
      alert('Пожалуйста, выбери фотографию!');
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);

    try {
      const response = await fetch('https://our-gallery-backend.onrender.com/api/photos', {
        method: 'POST',
        body: formData, 
      });

      if (response.ok) {
        setIsOpen(false);
        setImageFile(null);
        setPreviewUrl(null);
        setCaption('');
        window.location.reload(); 
      } else {
        alert('Упс, что-то пошло не так при сохранении...');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка подключения к серверу!');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <motion.button 
        className="fab-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <span>+</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="upload-overlay" onClick={() => setIsOpen(false)}>
            <motion.div 
              className="upload-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Добавить момент</h3>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ marginBottom: previewUrl ? '10px' : '20px' }}
              />

              {previewUrl && (
                <div className="preview-container">
                  <img src={previewUrl} alt="Превью" className="image-preview" />
                </div>
              )}
              
              <textarea 
                placeholder="Что напишем под фото?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              ></textarea>
              
              <button 
                className={`submit-btn ${isSending ? 'sending' : ''}`} 
                onClick={handleSave}
                disabled={isSending}
              >
                {isSending ? 'Загружаем фото... ⏳' : 'Сохранить в историю'}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UploadButton;