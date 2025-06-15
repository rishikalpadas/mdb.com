import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Fuse from "fuse.js";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import home from "../Assets/home.png";
import { ShopContext } from "../../Context/ShopContext";

// Define categories
const categories = [
  { name: "Apparel", path: "apparel" },
  { name: "Print & Pattern", path: "printpattern" },
  { name: "Theme-Based", path: "themebased" },
  { name: "Customization-Based", path: "customizationbased" },
  { name: "Business & Industry-Specific", path: "businessindustryspecific" },
];

// Initialize Fuse outside the component
const fuseOptions = {
  keys: ["name"],
  threshold: 0.4,
  includeScore: true,
};

const Navbar = () => {
  // Initialize Fuse inside the component to ensure it's always fresh
  const fuse = new Fuse(categories, fuseOptions);

  const [menu, setMenu] = useState("Shop");
  const { getTotalCartItems, coins } = useContext(ShopContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Perform search
    try {
      const results = fuse.search(value);
      console.log("Fuse search results:", results);

      if (results.length > 0) {
        setSearchResults(results.map((result) => result.item));
      } else {
        setSearchResults([{ name: "No matches found", path: "" }]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([{ name: "Error in search", path: "" }]);
    }
  };

  // Handle suggestion click
  // Handle suggestion click
  const handleSuggestionClick = (path) => {
    console.log("Suggestion clicked with path:", path);
    if (path) {
      navigate(`/${path}`); // Redirect to the category page
      // Clear the search input and results only if you want to close the suggestions
      setSearchQuery(""); // Clear the search input
      setSearchResults([]); // Clear the search results
      setIsSearchFocused(false); // Remove focus from search
      // Optionally, you can keep the suggestions open if you want to allow multiple clicks
    }
  };

  // Handle search focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // If there's a query but no results shown, perform search again
    if (searchQuery.trim() !== "" && searchResults.length === 0) {
      handleSearchChange({ target: { value: searchQuery } });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains("browse-categories-btn")
      ) {
        setSidebarOpen(false);
      }

      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scroll
  // Add this to your existing handleScroll function in useEffect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolledNow = window.scrollY > 70;
      setIsScrolled(isScrolledNow);

      // Add or remove class from body based on scroll position
      if (isScrolledNow) {
        document.body.classList.add("scrolled-nav");
        document.body.classList.remove("normal-nav");
      } else {
        document.body.classList.add("normal-nav");
        document.body.classList.remove("scrolled-nav");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderSearchSuggestions = () => {
  if (!isSearchFocused || searchResults.length === 0) return null;

  const searchRect = isScrolled
    ? document.querySelector(".compact-search-container").getBoundingClientRect()
    : document.querySelector(".search-container").getBoundingClientRect();

  const suggestionStyle = {
    top: `${searchRect.bottom + 5}px`,
    left: `${searchRect.left}px`,
    width: `${searchRect.width}px`,
  };

  return (
    <div
      ref={suggestionsRef}
      className="search-suggestions-container"
      style={suggestionStyle}
    >
      <ul className="search-suggestions-list">
        {searchResults.map((item, index) => (
          <li
            key={index}
            className={`search-suggestion-item ${!item.path ? "disabled" : ""}`}
            onClick={() => {
              console.log("Suggestion clicked:", item.path); // Debugging statement
              item.path && handleSuggestionClick(item.path);
            }} // Ensure path is valid
          >
            <span>{item.name}</span>
            {item.path && (
              <span className="suggestion-category">Category</span>
            )}
          </li>
        ))}
      </ul>
      {searchResults.length > 0 && searchResults[0].path && (
        <div className="search-footer">
          Click on a suggestion to browse that category
        </div>
      )}
    </div>
  );
};

  return (
    <header className={`sticky-header ${isScrolled ? "scrolled" : ""}`}>
      {/* Normal header */}
      <div className={`navbar ${isScrolled ? "hidden" : ""}`}>
        <div className="navbar-top-row">
          {/* Left side */}
          <div className="navbar-left">
            <button className="browse-categories-btn" onClick={toggleSidebar}>
              <span className="hamburger-icon">☰</span>
              <span className="browse-text">Design Categories</span>
            </button>
          </div>

          {/* Middle - Logo */}
          <div className="navbar-center">
            <div className="nav-logo">
              <Link to="/">
                <img src={logo} alt="ImagesBazaar" />
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="navbar-right">
            {/* Your existing right side content */}
            {/* <Link to="/" className="pricing-link">
              <img src={home} alt="" height={28} width={28} />
            </Link> */}
            {localStorage.getItem("auth-token") &&
            localStorage.getItem("role") === "Buyer" ? (
              <Link to="/pricing" className="pricing-link">
                Pricing
              </Link>
            ) : (
              <></>
            )}
            {localStorage.getItem("auth-token") ? (
              <button
                className="sign-btn logout-btn"
                onClick={() => {
                  localStorage.removeItem("auth-token");
                  localStorage.removeItem("role");
                  localStorage.removeItem("id");
                  localStorage.removeItem("username");
                  // window.location.replace("https://admin.mydesignbazaar.com/?logout=true");
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
            {localStorage.getItem("role") === "Designer" &&
            localStorage.getItem("auth-token") ? (
              <button
                className="designer-portal-btn"
                onClick={() => {
                  const authToken = localStorage.getItem("auth-token");
                  const role = localStorage.getItem("role");
                  const id = localStorage.getItem("id");
                  const username = localStorage.getItem("username");
                  // window.location.href = `https://admin.mydesignbazaar.com/?auth-token=${encodeURIComponent(
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
            {localStorage.getItem("role") === "Admin" &&
            localStorage.getItem("auth-token") ? (
              <button
                className="designer-portal-btn"
                onClick={() => {
                  const authToken = localStorage.getItem("auth-token");
                  const role = localStorage.getItem("role");
                  const id = localStorage.getItem("id");
                  const username = localStorage.getItem("username");
                  // window.location.href = `https://admin.mydesignbazaar.com/?auth-token=${encodeURIComponent(
                  window.location.href = `http://localhost:5173/?auth-token=${encodeURIComponent(
                    authToken
                  )}&role=${encodeURIComponent(role)}&id=${encodeURIComponent(
                    id
                  )}&username=${encodeURIComponent(username)}`;
                }}
              >
                Admin Portal
              </button>
            ) : null}
            <Link to="/cart" className="cart-icon-container">
              <img src={cart_icon} alt="Shopping Cart" />
              <div className="nav-cart-count">{getTotalCartItems()}</div>
            </Link>
            {/* <img src={cart_icon} alt="Shopping Cart" />
             */}
            Coins : &nbsp;
            {coins}
          </div>
        </div>

        {/* // Main Navbar Search Row */}
<div className="navbar-search-row">
  <div className="search-container">
    <input
      ref={searchInputRef}
      type="text"
      className="search-input"
      placeholder="Search the largest collection of Indian designs"
      value={searchQuery}
      onChange={handleSearchChange}
      onFocus={handleSearchFocus}
    />
    {renderSearchSuggestions()} 
  </div>
</div>

      </div>

      {/* Compact header */}
      <div className={`navbar-compact ${isScrolled ? "visible" : ""}`}>
        {/* Left side */}
        <div className="compact-left">
          <button className="browse-categories-btn" onClick={toggleSidebar}>
            <span className="hamburger-icon">☰</span>
          </button>
          <div className="nav-logo compact">
            <Link to="/">
              <img src={logo} alt="ImagesBazaar" />
            </Link>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="compact-center">
          <div className="compact-search-container">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Search the largest collection of Indian designs"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {/* <div className="search-dropdown">
              <span>Images</span>
              <span className="dropdown-arrow">▼</span>
            </div> */}
            {renderSearchSuggestions()}
          </div>
        </div>

        {/* Right side */}
        <div className="compact-right">
          {/* <Link to="/" className="pricing-link">
            <img src={home} alt="" height={28} width={28} />
          </Link> */}
          <Link to="/pricing" className="pricing-link">
            Pricing
          </Link>

          {localStorage.getItem("auth-token") ? (
            <button
              className="sign-btn logout-btn"
              onClick={() => {
                localStorage.removeItem("auth-token");
                localStorage.removeItem("role");
                localStorage.removeItem("id");
                localStorage.removeItem("username");
                // window.location.replace("https://admin.mydesignbazaar.com/?logout=true");
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

      {/* Sidebar */}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Categories</h3>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/apparel">Apparel</Link>
          </li>
          <li>
            <Link to="/printpattern">Print & Pattern</Link>
          </li>
          <li>
            <Link to="/themebased">Theme-Based</Link>
          </li>
          <li>
            <Link to="/customizationbased">Customization-Based</Link>
          </li>
          <li>
            <Link to="/businessindustryspecific">
              Business & Industry-Specific
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Navbar;
