// src/components/Sidebar.js
import './Sidebar.css';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import apiUrl from '../apiClient';
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiCode,
  FiDatabase,
  FiFolder,
  FiHelpCircle,
  FiHome,
  FiLayers,
  FiLogOut,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiSettings,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import { BiBell } from 'react-icons/bi';
import NotificationSettings from './NotificationSettings';
import GetHelpModal from './GetHelpModal';
import BillingModal from './BillingModal';
import MoreModal from './MoreModal';

function Sidebar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showGetHelp, setShowGetHelp] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('kc_user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem('kc_user')) || null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('kc:user-updated', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('kc:user-updated', syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kc_user');
    window.dispatchEvent(new Event('kc:user-updated'));
    navigate('/');
  };

  useEffect(() => {
    let abort = false;
    if (!showSearch || !query) { setSuggestions([]); return; }
    const url = apiUrl(`/api/malware?q=${encodeURIComponent(query)}`);
    fetch(url)
      .then(r => r.json())
      .then(list => { if (!abort) setSuggestions(list || []); })
      .catch(() => {});
    return () => { abort = true; };
  }, [query, showSearch]);

  return (
    <aside className="shadcn-sidebar">
      {/* Header with company name */}
      <div className="shadcn-sidebar-header">
        <div className="company-logo">
          <div className="logo-circle" />
        </div>
        <span className="company-name">KlevCatcher</span>
      </div>

      {/* Main Navigation */}
      <nav className="shadcn-nav">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
        >
          <FiHome />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
        >
          <FiLayers />
          <span>Reports</span>
        </NavLink>
        <NavLink to="/dashboard/threats" className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}>
          <FiBarChart2 />
          <span>Threats</span>
        </NavLink>
        <NavLink
          to="/dashboard/create"
          className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
        >
          <FiFolder />
          <span>Projects</span>
        </NavLink>
        <NavLink
          to="/dashboard/check"
          className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
        >
          <FiUsers />
          <span>Analys</span>
        </NavLink>
        <NavLink
          to="/dashboard/alerts"
          className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
        >
          <BiBell />
          <span>Alerts</span>
        </NavLink>
      </nav>

      {/* Documents Section */}
      <div className="shadcn-sidebar-section">
        <div className="section-label">Documents</div>
        <nav className="shadcn-nav">
          <NavLink
            to="/dashboard/sigma-collection"
            className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
          >
            <FiDatabase />
            <span>Data Library</span>
          </NavLink>
          <NavLink
            to="/dashboard/sigma"
            className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
          >
            <FiCode />
            <span>Sigma Rules</span>
          </NavLink>
          <button className="shadcn-nav-link" onClick={() => setShowMoreModal(true)}>
            <FiMoreHorizontal />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="shadcn-sidebar-footer">
        <nav className="shadcn-nav">
          <NavLink
            to="/dashboard/account"
            className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
          >
            <FiUser />
            <span>Account</span>
          </NavLink>
          <button className="shadcn-nav-link" onClick={() => setShowSearch(!showSearch)}>
            <FiSearch />
            <span>Search</span>
          </button>
          {currentUser?.role === 'admin' && (
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) => `shadcn-nav-link ${isActive ? 'active' : ''}`}
            >
              <FiSettings />
              <span>Settings</span>
            </NavLink>
          )}
          <button className="shadcn-nav-link" onClick={() => setShowGetHelp(true)}>
            <FiHelpCircle />
            <span>Get Help</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="shadcn-user-profile" style={{position: 'relative'}}>
          <div className="user-avatar-small">
            {currentUser?.profile?.avatar ? (
              <img src={currentUser.profile.avatar} alt="avatar" className="sidebar-avatar-img" />
            ) : (
              <FiUser />
            )}
          </div>
          <div className="user-info">
          <div className="user-name">{currentUser?.username || 'Гость'}</div>
          <div className="user-email">{currentUser?.email || 'm@example.com'}</div>
          </div>
          <button className="user-menu-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FiMoreHorizontal />
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <button
                className="profile-menu-item"
                onClick={() => {
                  navigate('/dashboard/account');
                  setShowProfileMenu(false);
                }}
              >
                <FiUser />
                <span>Account</span>
              </button>
              <button 
                className="profile-menu-item"
                onClick={() => {
                  setShowBilling(true);
                  setShowProfileMenu(false);
                }}
              >
                <FiAlertTriangle />
                <span>Billing</span>
              </button>
              <button 
                className="profile-menu-item"
                onClick={() => {
                  setShowNotificationSettings(true);
                  setShowProfileMenu(false);
                }}
              >
                <BiBell />
                <span>Notifications</span>
              </button>
              <div className="profile-menu-divider" />
              <button className="profile-menu-item" onClick={handleLogout}>
                <FiLogOut />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Search Modal */}
        {showSearch && (
          <div className="search-modal-overlay" onClick={() => setShowSearch(false)}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
              <input
                type="search"
                placeholder="Поиск malware..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {suggestions.length > 0 && (
                <div className="search-modal-results">
                  {suggestions.map(s => (
                    <button key={s.id} onClick={() => {
                      navigate(`/dashboard/malware/${s.id}`);
                      setShowSearch(false);
                      setQuery('');
                      setSuggestions([]);
                    }}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification Settings Modal */}
        <NotificationSettings
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />

        {/* Get Help Modal */}
        <GetHelpModal
          isOpen={showGetHelp}
          onClose={() => setShowGetHelp(false)}
        />

        {/* Billing Modal */}
        <BillingModal
          isOpen={showBilling}
          onClose={() => setShowBilling(false)}
        />

        {/* More Modal */}
        <MoreModal
          isOpen={showMoreModal}
          onClose={() => setShowMoreModal(false)}
        />
      </div>
    </aside>
  );
}

export default Sidebar;
