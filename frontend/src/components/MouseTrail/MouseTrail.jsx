import { useState, useEffect, useRef } from 'react';
import './MouseTrail.css';

const MouseTrail = () => {
  const [particles, setParticles] = useState([]);

  const lastCoords = useRef({ x: 0, y: 0 });

  const DISTANCE_THRESHOLD = 15;
  const PARTICLE_LIFETIME = 1500;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      const distance = Math.sqrt(
        Math.pow(x - lastCoords.current.x, 2) + Math.pow(y - lastCoords.current.y, 2)
      );

      if (distance > DISTANCE_THRESHOLD) {
        lastCoords.current = { x, y };

        const id = Date.now();
        const type = Math.random() > 0.5 ? 'trail-heart' : 'trail-sparkle';
        
        const newParticle = { id, x, y, type };

        setParticles((prev) => [...prev, newParticle]);

        setTimeout(() => {
          setParticles((prev) => prev.filter(p => p.id !== id));
        }, PARTICLE_LIFETIME);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`trail-particle ${particle.type}`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        />
      ))}
    </>
  );
};

export default MouseTrail;