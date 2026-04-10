import React from 'react';
import { motion } from 'framer-motion';
import './Preloader.css';

const Preloader = () => {
  return (
    <motion.div
      className="preloader-container"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="heart"></div>
    </motion.div>
  );
};

export default Preloader;