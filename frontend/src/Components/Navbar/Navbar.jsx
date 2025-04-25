import React, { useState, useContext, useRef } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import nav_dropdown from "../Assets/nav_dropdown.png";
const Navbar = () => {
  const [menu, setMenu] = useState("Shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" />
        <p>MY DESIGN BAZAAR</p>
      </div>
      <img
        className="nav-dropdown"
        src={nav_dropdown}
        alt=""
        onClick={dropdown_toggle}
      />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("Shop")}>
          <Link style={{ textDecoration: "none" }} to="/">
            Shop
          </Link>{" "}
          {menu === "Shop" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("Men")}>
          <Link style={{ textDecoration: "none" }} to="/mens">
            Men
          </Link>
          {menu === "Men" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("Women")}>
          <Link style={{ textDecoration: "none" }} to="/womens">
            Women
          </Link>
          {menu === "Women" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("Kids")}>
          <Link style={{ textDecoration: "none" }} to="/kids">
            Kids
          </Link>
          {menu === "Kids" ? <hr /> : null}
        </li>
      </ul>
      <div className="nav-login-cart">
        {localStorage.getItem("auth-token") ? (
          <button
            onClick={() => {
              // Clear localStorage in current domain (5173)
              localStorage.removeItem("auth-token");
              localStorage.removeItem("role");
              localStorage.removeItem("id");
              localStorage.removeItem("username");

              // Redirect to the other application with a logout parameter
              window.location.replace("http://localhost:5173/?logout=true");
            }}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}

        {localStorage.getItem("role") === "Designer" &&
        localStorage.getItem("auth-token") ? (
          <button
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
        <Link to="/cart">
          <img src={cart_icon} alt="" />
        </Link>

        <div className="nav-cart-count">{getTotalCartItems()}</div>
      </div>
    </div>
  );
};

export default Navbar;
