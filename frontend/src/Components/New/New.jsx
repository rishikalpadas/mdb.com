import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import './New.css';

const categories = [
  { name: 'Apparel', path: 'apparel' },
  { name: 'Print & Pattern', path: 'printpattern' },
  { name: 'Theme-Based', path: 'themebased' },
  { name: 'Customization-Based', path: 'customizationbased' },
  { name: 'Business & Industry-Specific', path: 'businessindustryspecific' },
];

const fuse = new Fuse(categories, {
  keys: ['name'],
  threshold: 0.4, // Adjust to control sensitivity
});

const New = () => {
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
      setSuggestions([]);
      return;
    }

    const results = fuse.search(value);
    if (results.length > 0) {
      setSuggestions(results.map(r => r.item));
    } else {
      setSuggestions([{ name: 'No matches found. Try other keywords.', path: '' }]);
    }
  };

  const handleSuggestionClick = (path) => {
    if (path) {
      navigate(`/${path}`);
      setShowModal(false);
    }
  };

  return (
    <div className="new-container">
      <div className="new-content">
        <h1>What's New</h1>
        <p>Design Concepts & Ideas</p>
        <button className="explore-btn" onClick={() => setShowModal(true)}>
          Explore Now
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Search Concepts</h2>
            <input
              type="text"
              placeholder="Type to search..."
              value={query}
              onChange={handleSearch}
              className="search-input"
            />
            <ul className="results-list">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(item.path)}
                  style={{ cursor: item.path ? 'pointer' : 'default', color: item.path ? '#333' : '#888' }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default New;
