import React from 'react';
import './Popular.css';

const Popular = () => {
  // Sample image data with URLs added
  const images = [
    {
      id: 1,
      src: "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Apparel Categories",
      className: "item wide",
      url: "/apparel"
    },
    {
      id: 2,
      src: "https://images.pexels.com/photos/691710/pexels-photo-691710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Print & Pattern Categories",
      className: "item medium",
      url: "/printpattern"
    },
    {
      id: 4,
      src: "https://images.pexels.com/photos/137032/pexels-photo-137032.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Theme-Based Categories",
      className: "item medium",
      url: "/themebased"
    },
    {
      id: 5,
      src: "https://images.pexels.com/photos/5868731/pexels-photo-5868731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Customization-Based Categories",
      className: "item medium",
      url: "/customizationbased"
    },
    {
      id: 6,
      src: "https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      alt: "",
      caption: "Business & Industry-Specific Categories",
      className: "item medium",
      url: "/businessindustryspecific"
    },
  ];

  // Function to handle image click
  const handleImageClick = (url) => {
    window.location.href = url; // Redirects to the specified URL
    // Alternative: window.open(url, '_blank'); // Opens in a new tab
  };

  return (
    <div className="popular-container">
      <header className="popular-header">
        <h1>Popular Categories</h1>
        <p>Discover trending designs from our collection</p>
      </header>
      
      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className={image.className} onClick={() => handleImageClick(image.url)}>
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