  // src/components/MoreModal.js
import { FiX, FiGithub, FiCoffee, FiExternalLink } from 'react-icons/fi';
import './MoreModal.css';

function MoreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="more-modal-overlay" onClick={onClose}>
      <div className="more-modal" onClick={(e) => e.stopPropagation()}>
        <button className="more-modal-close" onClick={onClose}>
          <FiX />
        </button>
        
        <div className="more-modal-header">
          <h2>Дополнительно</h2>
          <p>Ссылки и поддержка проекта</p>
        </div>

        <div className="more-modal-content">
          <a 
            href="https://github.com/iKokich/KLEVCATCHER-DB" 
            target="_blank" 
            rel="noopener noreferrer"
            className="more-link-card"
          >
            <div className="more-link-icon github">
              <FiGithub />
            </div>
            <div className="more-link-info">
              <h3>GitHub проекта</h3>
              <p>Исходный код и документация</p>
            </div>
            <FiExternalLink className="more-link-arrow" />
          </a>

          <a 
            href="https://t.me/Ikokich" 
            target="_blank" 
            rel="noopener noreferrer"
            className="more-link-card coffee"
          >
            <div className="more-link-icon coffee-icon">
              <FiCoffee />
            </div>
            <div className="more-link-info">
              <h3>Buy me a coffee ☕</h3>
              <p>Поддержите разработку проекта</p>
            </div>
            <FiExternalLink className="more-link-arrow" />
          </a>
        </div>

        <div className="more-modal-footer">
          <p>KlevCatcher v1.1.0</p>
          <p>Made with ❤️</p>
        </div>
      </div>
    </div>
  );
}

export default MoreModal;
