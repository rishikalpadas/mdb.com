import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import Item from '../Item/Item';
import { base_url } from '../../Config/config';

const NewCollections = () => {
  const [new_collection, setNew_collection] = useState([]);

  useEffect(() => {
    fetch(`${base_url}/newcollections`)
      .then(res => res.json())
      .then(data => setNew_collection(data));
  }, []);

  // Function to determine if an item should be featured (larger size)
  const isFeatureItem = (index) => {
    // Make every 3rd and 7th item a featured item
    return index === 0 || index === 3 || index === 6;
  };

  return (
    <div className="new-collections">
      <h1>NEW COLLECTIONS</h1>
      <div className="collections-grid">
        {new_collection.map((item, i) => (
          <div 
            key={i} 
            className={`collection-item ${isFeatureItem(i) ? 'feature-item' : ''}`}
          >
            <Item 
              id={item.id} 
              name={item.name} 
              image={item.image} 
              // Price props removed
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCollections;