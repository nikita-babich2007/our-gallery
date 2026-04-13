import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = ({ startTyping }) => {
  const text = "Привет, это наша галерея...\u00A0❤️";
  const words = text.split(" ");

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
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="word-wrapper">
              {Array.from(word).map((letter, letterIndex) => (
                <motion.span 
                  variants={child} 
                  key={letterIndex} 
                  className="animated-letter"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>
      )}
    </div>
  );
};

export default Hero;