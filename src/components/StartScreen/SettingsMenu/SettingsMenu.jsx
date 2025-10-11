import { useState, useRef, useEffect } from 'react';
import { Settings, User, LogOut, LogIn } from 'lucide-react';
import '../../Components.css';
import './SettingsMenu.css';

export default function SettingsMenu({ isLoggedIn, onUpdateProfile, onLogIn, onLogOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="settings-menu-container" ref={menuRef}>
      <button 
        className={`settings-trigger ${isOpen ? 'rotate' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Settings size={25} />
      </button>
      
      {isOpen && (
        <div className="settings-dropdown">
          {isLoggedIn ? (
            <>
              <button
                className="settings-option"
                onClick={() => handleOptionClick(onUpdateProfile)}
                type="button"
              >
                <User size={18} />
                Update Profile
              </button>
              <button
                className="settings-option"
                onClick={() => handleOptionClick(onLogOut)}
                type="button"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </>
          ) : (
            <button
              className="settings-option"
              onClick={() => handleOptionClick(onLogIn)}
              type="button"
            >
              <LogIn size={18} />
              Log In
            </button>
          )}
        </div>
      )}
    </div>
  );
}