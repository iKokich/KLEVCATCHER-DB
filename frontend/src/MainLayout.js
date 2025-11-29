import { useState, useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { sparkOptions } from "./spark-options";

import "./App.css";
import MainNav from "./components/MainNav";
import AnimatedText from "./components/AnimatedText";
import Footer from "./components/Footer";
import FeaturesGrid from "./components/FeaturesGrid";
import ThemeToggle from "./components/ThemeToggle";
import AuthModal from "./components/AuthModal";
import AboutSection from "./components/AboutSection";
import PartnersSection from "./components/PartnersSection"; 
import ExpertiseSection from "./components/ExpertiseSection";

function MainLayout() {
  const [theme, setTheme] = useState('light');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState('login');
  const [backgroundClass, setBackgroundClass] = useState('section-home');

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  const openModal = (view) => { setModalView(view); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);
  const particlesInit = useCallback(async engine => await loadSlim(engine), []);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById('about');
      const partnersSection = document.getElementById('partners');
      const expertiseSection = document.getElementById('expertise');
      if (!aboutSection || !partnersSection || !expertiseSection) return;

      // Обновленная логика скролла для четырех секций
      if (expertiseSection.getBoundingClientRect().top < window.innerHeight / 2) {
        setBackgroundClass('section-expertise');
      } else if (partnersSection.getBoundingClientRect().top < window.innerHeight / 2) {
        setBackgroundClass('section-partners');
      } else if (aboutSection.getBoundingClientRect().top < window.innerHeight / 2) {
        setBackgroundClass('section-about');
      } else {
        setBackgroundClass('section-home');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`app-wrapper ${theme}-theme ${backgroundClass}`}>
      <Particles id="tsparticles" init={particlesInit} options={sparkOptions} />
      
      <header className="main-header">
        <MainNav
          theme={theme}
          items={[
            { label: 'Home', to: 'home' }, 
            { label: 'О нас', to: 'about' },
            { label: 'Партнеры', to: 'partners' },
            { label: 'Экспертиза', to: 'expertise' },
            { label: 'FAQ', to: 'faq' },
          ]}
        />
        <nav>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="login-btn" onClick={() => openModal('login')}>Войти</button>
          <span>или</span>
          <button className="register-btn" onClick={() => openModal('register')}>Регистрация</button>
        </nav>
      </header>

      {/* Первая секция */}
      <div id="home" className="container">
        <div className="main-screen-content">
          <AnimatedText />
          <FeaturesGrid />
        </div>
        <Footer />
      </div>

      {/* Вторая секция */}
      <AboutSection />
      
      {/* Третья секция */}
      <PartnersSection />

      {/* Четвертая секция */}
      <ExpertiseSection />

      <AuthModal isOpen={isModalOpen} onClose={closeModal} initialView={modalView} theme={theme} />
    </div>
  );
}

export default MainLayout;