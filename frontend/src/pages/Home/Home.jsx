import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import Preloader from '../../components/Preloader/Preloader';
import Hero from '../../components/Hero/Hero';
import Gallery from '../../components/Gallery/Gallery';
import MouseTrail from '../../components/MouseTrail/MouseTrail';
import UploadButton from '../../components/UploadButton/UploadButton';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader key="loader" />}
      </AnimatePresence>

      <MouseTrail />

      <div className="app-container">
        <Hero startTyping={!isLoading} />
        <Gallery />
      </div>

      <UploadButton />
    </>
  );
};

export default Home;