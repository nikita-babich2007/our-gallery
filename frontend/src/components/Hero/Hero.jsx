import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = ({ startTyping }) => {
  // Используем обычный пробел, но перед сердечком ставим неразрывный пробел, 
  // чтобы оно не отрывалось от точек и не улетало на новую строку в одиночестве.
  const text = "Привет, это наша галерея...\u00A0❤️";
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05, 
        delayChildren: 0.5
      },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <div className="hero-container">
      {startTyping && (
        <motion.h1
          className="hero-title"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {letters.map((letter, index) => (
            <motion.span 
              variants={child} 
              key={index} 
              className="animated-letter"
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>
      )}
    </div>
  );
};

export default Hero;