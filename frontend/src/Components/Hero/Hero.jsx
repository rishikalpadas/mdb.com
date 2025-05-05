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

      <div className="slider-indicators">
        {slides.map((_, index) => (
          <span 
            key={index} 
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero