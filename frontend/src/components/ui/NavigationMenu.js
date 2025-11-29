import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-scroll';
import './NavigationMenu.css';

export function NavigationMenu({ children, className = '' }) {
  return (
    <nav className={`nav-menu ${className}`}>
      {children}
    </nav>
  );
}

export function NavigationMenuList({ children, className = '' }) {
  return (
    <ul className={`nav-menu-list ${className}`}>
      {children}
    </ul>
  );
}

export function NavigationMenuItem({ children, className = '' }) {
  return (
    <li className={`nav-menu-item ${className}`}>
      {children}
    </li>
  );
}

export function NavigationMenuTrigger({ children, className = '', onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <button
      ref={triggerRef}
      className={`nav-menu-trigger ${isOpen ? 'is-open' : ''} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <svg className="nav-chevron" viewBox="0 0 12 12" fill="none">
        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  );
}


export function NavigationMenuContent({ children, className = '' }) {
  return (
    <div className={`nav-menu-content ${className}`}>
      {children}
    </div>
  );
}

export function NavigationMenuLink({ children, to, href, className = '', asChild = false }) {
  if (to) {
    return (
      <Link
        to={to}
        smooth={true}
        duration={500}
        offset={-100}
        className={`nav-menu-link ${className}`}
      >
        {children}
      </Link>
    );
  }
  
  if (href) {
    return (
      <a href={href} className={`nav-menu-link ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <span className={`nav-menu-link ${className}`}>
      {children}
    </span>
  );
}

// Компонент с выпадающим меню
export function NavigationMenuItemWithDropdown({ trigger, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <li 
      ref={itemRef}
      className={`nav-menu-item has-dropdown ${isOpen ? 'is-open' : ''} ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="nav-menu-trigger">
        {trigger}
        <svg className="nav-chevron" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className="nav-menu-content">
          {children}
        </div>
      )}
    </li>
  );
}

export default NavigationMenu;
