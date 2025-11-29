import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

const API_URL = 'http://127.0.0.1:5000';

// Принимаем новый пропс `theme`
function AuthModal({ isOpen, onClose, initialView = 'login', theme }) {
  const navigate = useNavigate();
  const [view, setView] = useState(initialView);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (view === 'register') {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают!');
        return;
      }
      try {
        const response = await axios.post(`${API_URL}/register`, { username, email, password });
        setSuccess(response.data.message + " Теперь вы можете войти.");
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка регистрации');
      }
    } else { // 'login'
      try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const userPayload = response.data?.user;
        if (userPayload) {
          localStorage.setItem('kc_user', JSON.stringify(userPayload));
          window.dispatchEvent(new Event('kc:user-updated'));
        }
        // Reset loading screen flag so it shows on dashboard
        sessionStorage.removeItem('kc_loading_shown');
        setSuccess((response.data?.message || '') + " Перенаправляем...");
        
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1000); 

      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка входа');
      }
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      {/* Добавляем класс темы к самому корневому элементу Dialog */}
      <Dialog as="div" className={`auth-dialog-container ${theme}-theme`} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="auth-overlay" />
        </Transition.Child>

        <div className="auth-panel-wrapper">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="auth-panel">
              <button className="close-btn" onClick={onClose}><FiX /></button>
              
              <div className="auth-header">
                <h3 className="auth-title">{view === 'login' ? 'Log in to your account' : 'Create an account'}</h3>
                <p className="auth-subtitle">{view === 'login' ? 'Welcome back! Please enter your details.' : 'Get started by creating a new account.'}</p>
              </div>

              <div className="auth-view-switcher">
                <button onClick={() => setView('register')} className={`auth-view-btn ${view === 'register' ? 'active' : ''}`}>Sign up</button>
                <button onClick={() => setView('login')} className={`auth-view-btn ${view === 'login' ? 'active' : ''}`}>Log in</button>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
                {view === 'register' && (
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" placeholder="Enter your username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {view === 'register' && (
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                )}

                {view === 'login' && (
                  <div className="form-options">
                    <div className="checkbox-group">
                      <input type="checkbox" id="remember" />
                      <label htmlFor="remember">Remember for 30 days</label>
                    </div>
                    <button type="button" className="forgot-password-link">Forgot password</button>
                  </div>
                )}
                
                <button type="submit" className="auth-submit-btn">
                  {view === 'login' ? 'Войти' : 'Создать аккаунт'}
                </button>
              </form>

              <button className="google-btn">
                <FcGoogle />
                Sign in with Google
              </button>

              {error && <p className="auth-message error">{error}</p>}
              {success && <p className="auth-message success">{success}</p>}

              <div className="switch-form-footer">
                {view === 'login' ? (
                  <p>Don't have an account? <button onClick={() => setView('register')} className="switch-form-link">Sign up</button></p>
                ) : (
                  <p>Already have an account? <button onClick={() => setView('login')} className="switch-form-link">Log in</button></p>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AuthModal;