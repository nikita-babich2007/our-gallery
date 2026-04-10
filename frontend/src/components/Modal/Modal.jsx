import React from 'react';
import { motion } from 'framer-motion';
import './Modal.css';

const Modal = ({ image, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-content-wrapper"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Чтобы клик по самой фотке не закрывал окно
      >
        <button className="modal-close" onClick={onClose}>×</button>
        {/* ВОТ ТУТ ГЛАВНОЕ ИЗМЕНЕНИЕ: просто src={image} */}
        <img src={image} alt="Увеличенное фото" className="modal-image" />
      </motion.div>
    </div>
  );
};

export default Modal;