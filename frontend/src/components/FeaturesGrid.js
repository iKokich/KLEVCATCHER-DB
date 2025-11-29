import React from 'react';
import './FeaturesGrid.css';

const GridItem = ({ className, category, title, description }) => {
  const handleMouseMove = (e) => {
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    item.style.setProperty('--mouse-x', `${x}px`);
    item.style.setProperty('--mouse-y', `${y}px`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    item.style.setProperty('--rotate-x', `${rotateX}deg`);
    item.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const handleMouseLeave = (e) => {
    const item = e.currentTarget;
    item.style.setProperty('--rotate-x', '0deg');
    item.style.setProperty('--rotate-y', '0deg');
  };

  const particles = Array.from({ length: 20 });

  return (
    <div
      className={`grid-item ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="item-content">
        <p className="category">{category}</p>
        <h4>{title}</h4>
        <p className="description">{description}</p>
      </div>
      <div className="particles-container">
        {particles.map((_, index) => (
          <div
            key={index}
            className="particle"
            style={{ animationDelay: `${Math.random() * -20}s` }}
          />
        ))}
      </div>
    </div>
  );
};

function FeaturesGrid() {
  return (
    <div className="features-container">
      <GridItem
        className="item-insights"
        category="Insights"
        title="Analytics"
        description="Track user behavior"
      />
      <GridItem
        className="item-overview"
        category="Overview"
        title="Dashboard"
        description="Centralized data view"
      />
      <GridItem
        className="item-teamwork"
        category="Teamwork"
        title="Collaboration"
        description="Work together seamlessly"
      />
      <GridItem
        className="item-efficiency"
        category="Efficiency"
        title="Automation"
        description="Streamline workflows"
      />
      <GridItem
        className="item-connectivity"
        category="Connectivity"
        title="Integration"
        description="Connect favorite tools"
      />
      <GridItem
        className="item-protection"
        category="Protection"
        title="Security"
        description="Enterprise-grade protection"
      />
    </div>
  );
}

export default FeaturesGrid;