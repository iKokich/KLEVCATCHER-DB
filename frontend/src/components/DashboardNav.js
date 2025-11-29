// src/components/DashboardNav.js
import { NavLink } from 'react-router-dom';
import './DashboardNav.css';

const DashboardNav = ({ items, className = '' }) => {
  return (
    <nav className={`dashboard-nav ${className}`}>
      <ul className="dashboard-nav-list">
        {items.map((item, i) => (
          <li key={item.to || `item-${i}`}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dashboard-nav-link ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DashboardNav;
