import React, { useState } from 'react';
import { base_url } from '../Config/config';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const config = base_url;
  const [state, setState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Designer"
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const login = async () => {
    setLoading(true);
    let responseData;
    try {
      const response = await fetch(`${config}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
      
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        localStorage.setItem('role', responseData.role);
        localStorage.setItem('id', responseData.id);
        localStorage.setItem('username', responseData.name);
        window.location.href = "/";
      } else {
        alert(responseData.errors);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const signup = async () => {
    setLoading(true);
    let responseData;
    try {
      const response = await fetch(`${config}/signup`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      responseData = await response.json();
      
      if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        localStorage.setItem('role', responseData.role);
        localStorage.setItem('id', responseData.id);
        localStorage.setItem('username', responseData.name);
        window.location.href = "/";
      } else {
        alert(responseData.errors);
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <div className="form-header">
          <h2>{state}</h2>
          <p>{state === "Login" ? "Welcome back" : "Join our community"}</p>
        </div>
        
        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <div className="input-group">
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={changeHandler}
                required
                placeholder="Your Name"
              />
            </div>
          )}
          
          <div className="input-group">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={changeHandler}
              required
              placeholder="Email Address"
            />
          </div>
          
          <div className="input-group password-group">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={changeHandler}
              required
              placeholder="Password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {/* {showPassword ? "Hide" : "Show"} */}
            </button>
          </div>
          
          {state === "Sign Up" && (
            <div className="input-group">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={changeHandler}
              >
                <option value="Designer">Designer</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="loginsignup-agree">
          <input
            id="agree"
            name="agree"
            type="checkbox"
          />
          <label htmlFor="agree">
            By continuing, I agree to the terms of use & privacy policy.
          </label>
        </div>
        
        <button 
          className="submit-btn"
          onClick={() => (state === "Login" ? login() : signup())}
          disabled={loading}
        >
          {loading ? (
            <span className="loading-text">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" />
                <path className="spinner-path" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            state === "Login" ? "Sign in" : "Create account"
          )}
        </button>
        
        <p className="loginsignup-login">
          {state === "Sign Up" ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => setState(state === "Sign Up" ? "Login" : "Sign Up")}>
            {state === "Sign Up" ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;