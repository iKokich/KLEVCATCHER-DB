// src/components/AboutSection.js
import React, { useCallback } from 'react'; // 1. Импортируем useCallback
import ScrambledText from './ScrambledText';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import './AboutSection.css';
import illustration from '../assets/arm.png';

function AboutSection() {
  const text = `Наше веб-приложение предлагает самую полную и актуальную базу данных об угрозах и вредоносном ПО. Мы предоставляем десятки готовых плейбуков для эффективного реагирования, выявления и нейтрализации кибератак любой сложности.`;
  
  const [sectionRef, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  // 2. Оборачиваем функции в useCallback, чтобы они не создавались заново
  const handleMouseMove = useCallback((e) => {
    const img = e.currentTarget.querySelector('img');
    if (!img) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const rotateX = (mouseY - centerY) / 15;
    const rotateY = (centerX - mouseX) / 15;
    
    img.style.setProperty('--rotate-x', `${rotateX}deg`);
    img.style.setProperty('--rotate-y', `${rotateY}deg`);
  }, []); // Пустой массив зависимостей означает, что функция никогда не изменится

  const handleMouseLeave = useCallback((e) => {
    const img = e.currentTarget.querySelector('img');
    if (!img) return;
    img.style.setProperty('--rotate-x', '0deg');
    img.style.setProperty('--rotate-y', '0deg');
  }, []); // Пустой массив зависимостей

  return (
    <div 
      id="about" 
      className={`section about-section ${isVisible ? 'is-visible' : ''}`}
      ref={sectionRef}
    >
      <div className="about-container">
        {/* Панель с картинкой */}
        <div 
          className="about-image-panel"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img src={illustration} alt="Illustration of an arm with a sword" />
        </div>

        {/* Панель с текстом */}
        <div className="about-text-panel">
          <ScrambledText radius={120} duration={1.5} speed={0.3} scrambleChars={".:"}>
            {text}
          </ScrambledText>
        </div>
      </div>
    </div>
  );
}

export default AboutSection;