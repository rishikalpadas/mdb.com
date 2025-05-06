import React, { useState, useEffect, useRef } from 'react'
import './Hero.css'
import hand_icon from '../Assets/hand_icon.png'
import arrow_icon from '../Assets/arrow.png'
import hero_image from '../Assets/hero_image.png'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);

  // Slide data
  const slides = [
    {
      title: "BEST DESIGN COLLECTIONS",
      headline: "choose",
      subHeadline1: "your",
      subHeadline2: "design",
      image: hero_image,
      btnText: "Explore More"
    },
    {
      title: "PREMIUM QUALITY",
      headline: "discover",
      subHeadline1: "new",
      subHeadline2: "styles",
      image: hero_image, // Use the same image for demo, replace with actual images
      btnText: "Explore More"
    },
    {
      title: "EXCLUSIVE OFFERS",
      headline: "upgrade",
      subHeadline1: "your",
      subHeadline2: "look",
      image: hero_image, // Use the same image for demo, replace with actual images
      btnText: "Explore More"
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    let interval;
    
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Handle mouse events to pause/resume slider
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? slides.length - 1 : prevSlide - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  return (
    <div 
      className='hero' 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={sliderRef}
    >
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="hero-left">
              <h2>{slide.title}</h2>
              <div className="hero-hand-icon">
                <p>{slide.headline}</p>
                <img src={hand_icon} alt="" />
              </div>
              <p>{slide.subHeadline1}</p>
              <p>{slide.subHeadline2}</p>
              <div className="hero-btn">
                <div>{slide.btnText}</div>
                <img src={arrow_icon} alt="" />
              </div>
            </div>
            
            <div className="hero-right">
              <img src={slide.image} alt="Hero" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="slider-arrow slider-arrow-left" onClick={goToPrevSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button className="slider-arrow slider-arrow-right" onClick={goToNextSlide}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Enhanced Indicators with Animation */}
      <div className="slider-indicators">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`indicator-wrapper ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          >
            <div className="indicator-dot">
              <div className="indicator-fill"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hero