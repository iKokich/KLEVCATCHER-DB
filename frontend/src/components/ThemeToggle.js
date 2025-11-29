// src/components/ThemeToggle.js
import { FiSun, FiMoon } from 'react-icons/fi';
import './ThemeToggle.css';

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle-btn" onClick={onToggle} title="Переключить тему">
      {/* 
        Эта логика показывает иконку того режима, НА КОТОРЫЙ мы переключимся.
        Если тема светлая, показываем луну. Если темная - солнце.
      */}
      {theme === 'light' ? <FiMoon /> : <FiSun />}
    </button>
  );
}

export default ThemeToggle;