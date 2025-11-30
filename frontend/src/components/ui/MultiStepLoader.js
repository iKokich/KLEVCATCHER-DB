// src/components/ui/MultiStepLoader.js
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiLoader } from 'react-icons/fi';
import './MultiStepLoader.css';

const defaultLoadingStates = [
  { text: "Подключение к VirusTotal API..." },
  { text: "Отправка индикатора на анализ..." },
  { text: "Сканирование антивирусными движками..." },
  { text: "Проверка репутации..." },
  { text: "Анализ поведения..." },
  { text: "Сбор результатов от движков..." },
  { text: "Формирование отчёта..." },
  { text: "Завершение анализа..." },
];

function MultiStepLoader({ 
  loading, 
  loadingStates = defaultLoadingStates, 
  duration = 1500,
  onComplete 
}) {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (prev >= loadingStates.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [loading, loadingStates.length, duration]);

  useEffect(() => {
    if (!loading && currentState > 0) {
      setCurrentState(0);
    }
  }, [loading, currentState]);

  if (!loading) return null;

  // Используем Portal чтобы рендерить в body для полноэкранного overlay
  return createPortal(
    <div className="multi-step-overlay">
      <div className="multi-step-modal">
        <div className="multi-step-glow" />
        
        <div className="multi-step-header">
          <div className="scanning-icon">
            <FiLoader className="spin" />
          </div>
          <h3>Сканирование...</h3>
        </div>

        <div className="multi-step-list">
          {loadingStates.map((state, index) => (
            <div 
              key={index} 
              className={`step-item ${
                index < currentState ? 'completed' : 
                index === currentState ? 'active' : 'pending'
              }`}
            >
              <div className="step-icon">
                {index < currentState ? (
                  <FiCheck />
                ) : index === currentState ? (
                  <FiLoader className="spin" />
                ) : (
                  <div className="step-dot" />
                )}
              </div>
              <span className="step-text">{state.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MultiStepLoader;
