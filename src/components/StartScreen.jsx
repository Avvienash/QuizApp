import './styles/Components.css';
import './styles/StartScreen.css';
import { categories } from '../utils/categories';
import DropdownMenu from './DropdownMenu';

export default function StartScreen({ onStart, onCategoryChange, selectedCategory}) {
  return (
    <div className="glass-screen">
      <h1 className="title">NewsFlash Quiz</h1>

      <button className="event-btn" onClick={onStart}>
        Ready for today's headlines?
      </button>
      
      <DropdownMenu 
        options={categories}
        value={selectedCategory}
        onChange={onCategoryChange}
      />

    </div>
  );
}
