import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './styles/Components.css';
import './styles/DropdownMenu.css';

export default function DropdownMenu({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (optionKey) => {
    onChange(optionKey);
    setIsOpen(false);
  };

  const selectedLabel = options[value] || "Select a category";

  return (
    <div className="custom-dropdown">
      <button 
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {selectedLabel}
        <ChevronDown 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          size={20}
        />
      </button>
      
      {isOpen && (
        <div className="dropdown-options">
          {Object.entries(options).map(([key, label]) => (
            <button
              key={key}
              className={`dropdown-option ${value === key ? 'selected' : ''}`}
              onClick={() => handleOptionClick(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && <div className="dropdown-backdrop" onClick={() => setIsOpen(false)} />}
    </div>
  );
}