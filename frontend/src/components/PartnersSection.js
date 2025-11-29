// src/components/PartnersSection.js
import React from 'react';
import LogoLoop from './LogoLoop';
import './PartnersSection.css';

import { 
  SiPostgresql, 
  SiPython, 
  SiGoogle, 
  SiReact,
  SiTailwindcss,
  SiThreedotjs
} from 'react-icons/si';
import { TbLetterS } from 'react-icons/tb';
import FifthElementIcon from './icons/FifthElementIcon';

const techLogos = [
  { node: <SiPostgresql />, title: "PostgreSQL", href: "https://www.postgresql.org/" },
  { node: <SiPython />, title: "Python", href: "https://www.python.org/" },
  { node: <TbLetterS />, title: "Sigma Rules", href: "https://github.com/SigmaHQ/sigma" },
  { node: <SiGoogle />, title: "Google", href: "https://google.com/" },
  { node: <FifthElementIcon />, title: "5th Element", href: "#" },
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
  { node: <SiThreedotjs />, title: "Three.js", href: "https://threejs.org/" },
];

function PartnersSection() {
  return (
    <div id="partners" className="section partners-section">
      <div className="partners-container">
        <h2 className="partners-title">Наши Технологии и Партнеры</h2>
        <LogoLoop
          logos={techLogos}
          speed={100}
          direction="left"
          logoHeight={48}
          gap={60}
          pauseOnHover
          scaleOnHover
          // СВОЙСТВО fadeOut УДАЛЕНО
        />
      </div>
    </div>
  );
}

export default PartnersSection;