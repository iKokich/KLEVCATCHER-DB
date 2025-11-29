// src/components/ui/Switch.js
import './Switch.css';

function Switch({ id, checked, onChange, disabled = false }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      className={`switch ${checked ? 'switch-checked' : ''} ${disabled ? 'switch-disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span className="switch-thumb" />
    </button>
  );
}

function Label({ htmlFor, children, className = '' }) {
  return (
    <label htmlFor={htmlFor} className={`switch-label ${className}`}>
      {children}
    </label>
  );
}

export { Switch, Label };
