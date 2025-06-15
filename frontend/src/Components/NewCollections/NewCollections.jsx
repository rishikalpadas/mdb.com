import React, { useEffect, useState } from "react";
import "./NewCollections.css";
import Item from "../Item/Item";
import { base_url } from "../../Config/config";

const NewCollections = () => {
  const [new_collection, setNew_collection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${base_url}/newcollections`)
      .then((res) => res.json())
      .then((data) => {
        setNew_collection(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching collections:", error);
        setLoading(false);
      });
  }, []);

  // Get a class for each item based on its position
  // This creates a pattern similar to the second image
  const getItemClass = (index) => {
    // Create a repeating pattern for the grid
    const pattern = index % 16;

    // Define specific positions for different sized items
    if ([2, 7, 11].includes(pattern)) {
      return "wide-item"; // Spans 2 columns
    } else if ([3, 9].includes(pattern)) {
      return "tall-item"; // Spans 2 rows
    } else if ([5, 13].includes(pattern)) {
      return "big-item"; // Spans 2 columns and 2 rows
    } else {
      return "small-item"; // Standard size
    }
  };

  return (
    <div className="new-collections">
      <h1>New Collections</h1>
      {loading ? (
        <div className="loading">Loading collections...</div>
      ) : (
        <div className="pinterest-grid">
          {new_collection.slice(0, 60).map((item, i) => (
            <div key={i} className="grid-item">
              <img src={item.image} alt={item.name} />
              <div className="item-caption">{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewCollections;
