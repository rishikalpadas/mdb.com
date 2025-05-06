import React from 'react';
import './Popular.css';

const Popular = () => {
  // Sample image data
  const images = [
    {
      id: 1,
      src: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Apparel Categories",
      className: "item wide"
    },
    {
      id: 2,
      src: "https://images.pexels.com/photos/691710/pexels-photo-691710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Print & Pattern Categories",
      className: "item medium"
    },
    // {
    //   id: 3,
    //   src: "/api/placeholder/500/700",
    //   alt: "Woman with smartphone",
    //   caption: "Digital Connection",
    //   className: "item tall"
    // },
    {
      id: 4,
      src: "https://images.pexels.com/photos/137032/pexels-photo-137032.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Theme-Based Categories",
      className: "item medium"
    },
    {
      id: 5,
      src: "https://images.pexels.com/photos/5868731/pexels-photo-5868731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Customization-Based Categories",
      className: "item medium"
    },
    {
      id: 6,
      src: "https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Business & Industry-Specific Categories",
      className: "item medium"
    },
    // {
    //   id: 7,
    //   src: "../Assets/product_11.png",
    //   alt: "Cyclists with helmets",
    //   caption: "Active Lifestyle",
    //   className: "item medium"
    // },
    // {
    //   id: 8,
    //   src: "../Assets/product_9.png",
    //   alt: "Friends at sunset",
    //   caption: "Golden Hour",
    //   className: "item medium"
    // },
    // {
    //   id: 9,
    //   src: "../Assets/product_15.png",
    //   alt: "VR technology with digital globe",
    //   caption: "Exploring Virtual Reality",
    //   className: "item wide"
    // },
  ];

  return (
    <div className="popular-container">
      <header className="popular-header">
        <h1>Popular Categories</h1>
        <p>Discover trending designs from our collection</p>
      </header>
      
      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className={image.className}>
            <div className="image-container">
              <img src={image.src} alt={image.alt} />
              <div className="overlay">
                <div className="caption">{image.caption}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popular;