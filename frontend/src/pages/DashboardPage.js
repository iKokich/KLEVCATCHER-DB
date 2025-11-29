// src/pages/DashboardPage.js
import { useEffect, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import './DashboardPage.css';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import NotificationContainer from '../components/NotificationContainer';
import LoadingScreen from '../components/LoadingScreen';
import apiUrl from '../apiClient';

function DashboardPage() {
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const [isLoading, setIsLoading] = useState(() => {
    // Show loading only on first visit after login
    const hasShownLoading = sessionStorage.getItem('kc_loading_shown');
    return !hasShownLoading;
  });
  const [notifications, setNotifications] = useState([]);
  const [lastAlertId, setLastAlertId] = useState(null);
  const [viewedAlerts, setViewedAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_viewed_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('kc_notification_settings');
      return saved ? JSON.parse(saved) : {
        silentMode: false,
        disableSigma: false,
        disableReports: false,
        disableThreats: false
      };
    } catch {
      return {
        silentMode: false,
        disableSigma: false,
        disableReports: false,
        disableThreats: false
      };
    }
  });

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  // Listen for notification settings changes
  useEffect(() => {
    const handleSettingsUpdate = (event) => {
      setNotificationSettings(event.detail);
    };
    window.addEventListener('kc:notification-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('kc:notification-settings-updated', handleSettingsUpdate);
  }, []);

  // Check if notification should be shown based on settings
  const shouldShowNotification = useCallback((type) => {
    if (type === 'sigma' && notificationSettings.disableSigma) return false;
    if (type === 'report' && notificationSettings.disableReports) return false;
    if (type === 'threat' && notificationSettings.disableThreats) return false;
    return true;
  }, [notificationSettings]);

  // Poll for new alerts every 10 seconds
  useEffect(() => {
    const fetchAlerts = () => {
      fetch(apiUrl('/api/alerts'))
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Only show the latest alert as a toast
            const latestAlert = data[0];
            
            // Check if this is a new alert we haven't shown yet AND not already viewed
            if (latestAlert.id !== lastAlertId && !viewedAlerts.includes(latestAlert.id)) {
              setLastAlertId(latestAlert.id);
              
              // Check if we should show this type of notification
              if (shouldShowNotification(latestAlert.type)) {
                setNotifications(prev => [
                  {
                    id: latestAlert.id,
                    type: latestAlert.type,
                    message: latestAlert.message,
                    username: latestAlert.username
                  },
                  ...prev.slice(0, 2) // Keep max 3 notifications visible
                ]);
              }
            }
          }
        })
        .catch(err => console.error('Error fetching alerts:', err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [lastAlertId, viewedAlerts, shouldShowNotification]); // Depend on lastAlertId, viewedAlerts and shouldShowNotification

  const handleCloseNotification = (id) => {
    // Mark as viewed and save to localStorage
    const newViewedAlerts = [...viewedAlerts, id];
    setViewedAlerts(newViewedAlerts);
    localStorage.setItem('kc_viewed_alerts', JSON.stringify(newViewedAlerts));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLoadingComplete = () => {
    sessionStorage.setItem('kc_loading_shown', 'true');
    setIsLoading(false);
  };

  return (
    <div className={`app-wrapper ${theme}-theme`}>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <header className="dashboard-header">
            <div className="dashboard-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </header>
          <Outlet />
        </main>
      </div>
      <NotificationContainer 
        notifications={notifications} 
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default DashboardPage;