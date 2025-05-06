import React, { useState, useContext, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";

const Navbar = () => {
  const [menu, setMenu] = useState("Shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.classList.contains('browse-categories-btn')) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle scroll for sticky header behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className={`sticky-header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Normal header (shown when not scrolled) */}
      <div className={`navbar ${isScrolled ? 'hidden' : ''}`}>
        <div className="navbar-top-row">
          {/* Left side - Browse Categories */}
          <div className="navbar-left">
            <button className="browse-categories-btn" onClick={toggleSidebar}>
              <span className="hamburger-icon">☰</span>
              <span className="browse-text">Browse Categories</span>
            </button>
          </div>

          {/* Middle - Logo */}
          <div className="navbar-center">
            <div className="nav-logo">
              <Link to="/">
                <img src={logo} alt="ImagesBazaar" />
                <p>imagesbazaar</p>
              </Link>
            </div>
          </div>

          {/* Right side - Pricing, Sign In, Cart */}
          <div className="navbar-right">
            <Link to="/pricing" className="pricing-link">Pricing</Link>
            
            {localStorage.getItem("auth-token") ? (
              <button 
                className="sign-btn logout-btn"
                onClick={() => {
                  localStorage.removeItem("auth-token");
                  localStorage.removeItem("role");
                  localStorage.removeItem("id");
                  localStorage.removeItem("username");
                  window.location.replace("http://localhost:5173/?logout=true");
                }}
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="sign-btn signin-btn">
                Sign In
              </Link>
            )}
            
            {localStorage.getItem("role") === "Designer" && localStorage.getItem("auth-token") ? (
              <button
                className="designer-portal-btn"
                onClick={() => {
                  const authToken = localStorage.getItem("auth-token");
                  const role = localStorage.getItem("role");
                  const id = localStorage.getItem("id");
                  const username = localStorage.getItem("username");
                  window.location.href = `http://localhost:5173/?auth-token=${encodeURIComponent(
                    authToken
                  )}&role=${encodeURIComponent(role)}&id=${encodeURIComponent(
                    id
                  )}&username=${encodeURIComponent(username)}`;
                }}
              >
                Designer Portal
              </button>
            ) : null}
            
            <Link to="/cart" className="cart-icon-container">
              <img src={cart_icon} alt="Shopping Cart" />
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </Link>
          </div>
        </div>

        {/* Search Row */}
        {/* <div className="navbar-search-row">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search the largest collection of Indian images" 
            />
            <div className="search-dropdown">
              <span>Images</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            <div className="search-by-image">
              <span className="search-icon">🔍</span>
              <span className="search-by-text">Search by image</span>
            </div>
          </div>
        </div> */}
      </div>
      
      {/* Compact header (shown when scrolled) */}
      <div className={`navbar-compact ${isScrolled ? 'visible' : ''}`}>
        {/* Left side - Browse Categories */}
        <div className="compact-left">
          <button className="browse-categories-btn" onClick={toggleSidebar}>
            <span className="hamburger-icon">☰</span>
          </button>
          
          <div className="nav-logo compact">
            <Link to="/">
              <img src={logo} alt="ImagesBazaar" />
              <p>imagesbazaar</p>
            </Link>
          </div>
        </div>
        
        {/* Center - Search bar */}
        {/* <div className="compact-center">
          <div className="compact-search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search the largest collection of Indian images" 
            />
            <div className="search-dropdown">
              <span>Images</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div> */}
        
        {/* Right side - Navigation links */}
        <div className="compact-right">
          <Link to="/pricing" className="pricing-link">Pricing</Link>
          
          {localStorage.getItem("auth-token") ? (
            <button 
              className="sign-btn logout-btn"
              onClick={() => {
                localStorage.removeItem("auth-token");
                localStorage.removeItem("role");
                localStorage.removeItem("id");
                localStorage.removeItem("username");
                window.location.replace("http://localhost:5173/?logout=true");
              }}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="sign-btn signin-btn">
              Sign In
            </Link>
          )}
          
          <Link to="/cart" className="cart-icon-container">
            <img src={cart_icon} alt="Shopping Cart" />
            <div className="nav-cart-count">{getTotalCartItems()}</div>
          </Link>
        </div>
      </div>
      
      {/* Sidebar for Browse Categories */}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <ul className="sidebar-menu">
          <li><Link to="/apparel">Apparel</Link></li>
          <li><Link to="/print-and-pattern">Print & Pattern</Link></li>
          <li><Link to="/theme-based">Theme-Based</Link></li>
          <li><Link to="/customization-based">Customization-Based</Link></li>
          <li><Link to="/business-and-industry">Business & Industry-Specific</Link></li>
          {/* <li><Link to="/foodcuisine">Food & Cuisine</Link></li>
          <li><Link to="/naturelandscapes">Nature & Landscapes</Link></li>
          <li><Link to="/education">Education</Link></li>
          <li><Link to="/technology">Technology</Link></li>
          <li><Link to="/healthcare">Healthcare</Link></li> */}
        </ul>
      </div>
      
      {/* Overlay for when sidebar is open */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </header>
  );
};

export default Navbar;