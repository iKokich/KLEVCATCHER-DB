// src/components/ExpertiseSection.js
import React from 'react';
import './ExpertiseSection.css';
import ciiCardImage from '../assets/LFI.png';

// Компонент для маленькой карточки со статистикой
const StatCard = ({ description, value }) => (
  <div className="stat-card">
    <p>{description}</p>
    <span>{value}</span>
  </div>
);

// Компонент для большой черной карточки
const CtaCard = () => (
  <div className="cta-card">
    <img src={ciiCardImage} alt="Cyber Identity Index" />
    {/* ИЗМЕНЕНИЕ: Убираем div с текстом, чтобы его не было на картинке */}
  </div>
);

function ExpertiseSection() {
  return (
    <div id="expertise" className="section expertise-section">
      <div className="expertise-container">
        <h1 className="expertise-title">Наша экспертиза</h1>
        <div className="expertise-grid">
          <StatCard 
            description="В 2024 году количество кибератак с помощью программ-вымогателей возросло на" 
            value="44%" 
          />
          <CtaCard />
          <StatCard 
            description="Пиратских ресурсов приходится на зону .ru, лидера для российских пиратов по регистрации новых ресурсов" 
            value="22.8%" 
          />
          <StatCard 
            description="Число прогосударственных хакерских групп, атаковавших Россию и страны СНГ, в 2024 выросло в 2 раза и составило" 
            value="27" 
          />
          <StatCard 
            description="Средняя сумма выкупа для крупных и средних организаций начинается с" 
            value="50 000$" 
          />
          <StatCard 
            description="Успешных исследований киберпреступлений по всему миру" 
            value="1300+" 
          />
        </div>
      </div>
    </div>
  );
}

export default ExpertiseSection;