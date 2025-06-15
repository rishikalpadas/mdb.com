import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import {base_url} from '../../Config/config'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState([]);
  const sliderRef = useRef(null);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${base_url}/fetchProducts`);
        const data = await response.json();
  
        const mappedSlides = data.map(product => ({
          // title: "Latest Designs", // You can customize this as needed
          // headline: "Discover",
          subHeadline1: "Top Selling",
          subHeadline2: "Designs",
          imageUrl: product.image, // Already a full image URL
          btnText: "Explore More"
        }));
  
        setSlides(mappedSlides);
      } catch (error) {
        console.error('Error fetching slides:', error);
      }
    };
  
    fetchSlides();
  }, []);
  

  // Auto slide
  useEffect(() => {
    let interval;
    if (!isPaused && slides.length) {
      interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPaused, slides]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const goToSlide = (index) => setCurrentSlide(index);
  const goToPrevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className='hero' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={sliderRef}>
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div key={index} className={`hero-slide ${index === currentSlide ? 'active' : ''}`}>
            <div className="hero-left">
              {/* <h2>{slide.title}</h2> */}
              {/* <div className="hero-hand-icon">
                <p className='hero-hand'>{slide.headline}</p>
                <img src={hand_icon} alt="" />
              </div> */}
              <p className='hero-subhead1'>{slide.subHeadline1}</p>
              <p className='hero-subhead2'>{slide.subHeadline2}</p>
              <div className="hero-btn">
                <div>{slide.btnText}</div>
                <img src={arrow_icon} alt="" />
              </div>
            </div>

            <div className="hero-right">
              <img src={slide.imageUrl} alt="Hero" /> {/* Dynamically loaded image */}
            </div>
          </div>
        ))}
      </div>

      <button className="slider-arrow slider-arrow-left" onClick={goToPrevSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <button className="slider-arrow slider-arrow-right" onClick={goToNextSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      <div className="slider-indicators">
        {slides.map((_, index) => (
          <div key={index} className={`indicator-wrapper ${index === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(index)}>
            <div className="indicator-dot"><div className="indicator-fill"></div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
