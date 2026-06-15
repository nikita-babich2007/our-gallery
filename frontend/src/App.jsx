import React from 'react';
import Home from './pages/Home/Home';
import './App.css';

function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker зарегистрирован!', reg))
        .catch(err => console.log('Ошибка регистрации SW:', err));
    }
  }, []);
  
  return <Home />;
}

export default App;