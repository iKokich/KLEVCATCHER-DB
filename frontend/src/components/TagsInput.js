// src/components/TagsInput.js
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import './TagsInput.css';

function TagsInput({ value = [], onChange, placeholder = "Add tag...", label, suggestions = [] }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInputValue('');
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleClear = () => {
    onChange([]);
    setInputValue('');
  };

  const filteredSuggestions = suggestions.filter(
    s => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="tags-input-root">
      {label && <label className="tags-input-label">{label}</label>}
      <div className="tags-input-container">
        {value.map((tag) => (
          <div key={tag} className="tags-input-item">
            <span className="tags-input-item-text">{tag}</span>
            <button
              type="button"
              className="tags-input-item-delete"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              <FiX />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="tags-input-input"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="tags-input-suggestions">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="tags-input-suggestion-item"
                onClick={() => {
                  if (!value.includes(suggestion)) {
                    onChange([...value, suggestion]);
                  }
                  setInputValue('');
                  setShowSuggestions(false);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <button
          type="button"
          className="tags-input-clear"
          onClick={handleClear}
        >
          <FiX className="clear-icon" />
          Clear
        </button>
      )}
    </div>
  );
}

export default TagsInput;
