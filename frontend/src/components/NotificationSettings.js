// src/components/NotificationSettings.js
import { useState, useEffect } from 'react';
import { BiMobileVibration, BiBellOff, BiX } from 'react-icons/bi';
import { Switch, Label } from './ui/Switch';
import './NotificationSettings.css';

function NotificationSettings({ isOpen, onClose }) {
  const [settings, setSettings] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem('kc_notification_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('kc:notification-settings-updated', { detail: settings }));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="notification-settings-overlay" onClick={onClose}>
      <div className="notification-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="notification-settings-header">
          <h3>Notification Settings</h3>
          <button className="notification-settings-close" onClick={onClose}>
            <BiX />
          </button>
        </div>

        <div className="notification-settings-content">
          {/* Silent Mode */}
          <div className="notification-setting-item">
            <div className="notification-setting-info">
              <div className="notification-setting-icon silent">
                <BiMobileVibration />
              </div>
              <div className="notification-setting-text">
                <Label htmlFor="silent-mode">Silent Mode</Label>
                <p>Disable all notification sounds</p>
              </div>
            </div>
            <Switch
              id="silent-mode"
              checked={settings.silentMode}
              onChange={(value) => updateSetting('silentMode', value)}
            />
          </div>

          <div className="notification-settings-divider" />

          {/* Disable Sigma Notifications */}
          <div className="notification-setting-item">
            <div className="notification-setting-info">
              <div className="notification-setting-icon disabled">
                <BiBellOff />
              </div>
              <div className="notification-setting-text">
                <Label htmlFor="disable-sigma">Sigma Rules</Label>
                <p>Disable notifications about new Sigma rules</p>
              </div>
            </div>
            <Switch
              id="disable-sigma"
              checked={settings.disableSigma}
              onChange={(value) => updateSetting('disableSigma', value)}
            />
          </div>

          {/* Disable Reports Notifications */}
          <div className="notification-setting-item">
            <div className="notification-setting-info">
              <div className="notification-setting-icon disabled">
                <BiBellOff />
              </div>
              <div className="notification-setting-text">
                <Label htmlFor="disable-reports">Reports</Label>
                <p>Disable notifications about new reports</p>
              </div>
            </div>
            <Switch
              id="disable-reports"
              checked={settings.disableReports}
              onChange={(value) => updateSetting('disableReports', value)}
            />
          </div>

          {/* Disable Threats Notifications */}
          <div className="notification-setting-item">
            <div className="notification-setting-info">
              <div className="notification-setting-icon disabled">
                <BiBellOff />
              </div>
              <div className="notification-setting-text">
                <Label htmlFor="disable-threats">Threats</Label>
                <p>Disable notifications about new threats</p>
              </div>
            </div>
            <Switch
              id="disable-threats"
              checked={settings.disableThreats}
              onChange={(value) => updateSetting('disableThreats', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
