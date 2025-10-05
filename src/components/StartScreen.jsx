import './Components.css';

const categories = ["world","uk","business","politics","health","tech","science","education","entertainment","sport","africa","asia","europe","latin_america","middle_east","us_canada","travel","culture","music","film_tv","art_design","books","style","ai","science_health"];

export default function StartScreen({ onStart, onCategoryChange, selectedCategory}) {
  return (
    <div className="glass-screen">
      <h1 className="title">NewsFlash Quiz</h1>
      
      <div className="glass-dropdown">
        <select 
          className="dropdown-select" 
          value={selectedCategory || "world"} 
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <button className="event-btn" onClick={onStart}>
        Ready for today's headlines?
      </button>
    </div>
  );
}
