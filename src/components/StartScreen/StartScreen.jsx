import '../Components.css';
import './StartScreen.css';
import { categories } from '../../utils/categories';
import DropdownMenu from './DropdownMenu/DropdownMenu';
import SettingsMenu from './SettingsMenu/SettingsMenu';

export default function StartScreen({ onStart, onCategoryChange, selectedCategory, isLoggedIn, onLogIn, onLogOut, onUpdateProfile, session }) {
  
  // Get Name from session if available
  const displayName = session?.user?.user_metadata?.name;
  const displayMessage = displayName ? `Welcome to NewsFlash Quiz, ${displayName}!` : 'Welcome to NewsFlash Quiz!';
  
  return (
    <div className="glass-screen" style={{ position: 'relative' }}>
      <SettingsMenu 
        isLoggedIn={isLoggedIn}
        onUpdateProfile={onUpdateProfile}
        onLogIn={onLogIn}
        onLogOut={onLogOut}
      />
      
      <h1 className="title"> {displayMessage} </h1>

      <DropdownMenu 
        options={categories}
        value={selectedCategory}
        onChange={onCategoryChange}
      />

      <button className="event-btn" onClick={onStart}>
        Ready for today's headlines?
      </button>
      
      
    </div>
  );
}
