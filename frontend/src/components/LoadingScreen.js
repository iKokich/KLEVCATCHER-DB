// src/components/LoadingScreen.js
import { useEffect } from 'react';
import './LoadingScreen.css';

function LoadingScreen({ onComplete }) {
  useEffect(() => {
    // Complete loading after animation finishes (2.5s)
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-circle-animated" />
        </div>
        <h1 className="loading-title">KlevCatcher</h1>
        <div className="loading-bar-container">
          <div className="loading-bar" />
        </div>
        <p className="loading-text">Загрузка данных...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
