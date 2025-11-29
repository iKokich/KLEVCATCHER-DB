import React from 'react';
import { Link } from 'react-scroll';
import './MainNav.css';

function MainNav({ items = [], theme = 'light' }) {
  return (
    <nav className={`main-nav ${theme}-nav`}>
      <ul className="main-nav-list">
        {items.map((item, index) => (
          <li key={item.to || index} className="main-nav-item">
            <Link
              to={item.to}
              spy={true}
              smooth={true}
              offset={-100}
              duration={500}
              activeClass="active"
              className="main-nav-link"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MainNav;
