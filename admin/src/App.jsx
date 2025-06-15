import React, { useEffect, useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import { Navigate } from 'react-router-dom'

const App = () => {
  // Use state to track authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First, extract URL parameters if they exist
    const params = new URLSearchParams(window.location.search);
    const authTokenFromURL = params.get('auth-token');
    const roleFromURL = params.get('role');
    const idFromURL = params.get('id');
    const nameFromURL = params.get('username');
    const shouldLogout = params.get('logout');
    
    // Handle logout parameter if present
    if (shouldLogout === 'true') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      localStorage.removeItem('username');
      console.log('Logged out successfully');
      // Redirect back to login page after clearing storage
      // window.location.href = 'https://mydesignbazaar.com/';
      window.location.href = 'http://localhost:5174/';
      return;
    }
    
    // Save to localStorage if parameters exist
    if (authTokenFromURL) {
      localStorage.setItem('auth-token', authTokenFromURL);
    }
    
    if (roleFromURL) {
      localStorage.setItem('role', roleFromURL);
    }

    if (idFromURL) {
      localStorage.setItem('id', idFromURL);
    }

    if (nameFromURL) {
      localStorage.setItem('username', nameFromURL);
    }
    
    // Clean up the URL after extracting parameters
    if (authTokenFromURL || roleFromURL || shouldLogout) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Now check authentication with possibly updated values
    const authToken = localStorage.getItem('auth-token');
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('id');
    const name = localStorage.getItem('username');
    
    if (!authToken || role !== 'Designer' && role!=='Admin') {
      // Not authenticated, redirect to login site
      // window.location.href = 'https://mydesignbazaar.com/';
      window.location.href = 'http://localhost:5174/';
    } else {
      // User is authenticated
      console.log('Authenticated');
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, []);

  // Show nothing while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authentication check is complete and user is authenticated
  if (isAuthenticated) {
    return (
      <div>
        <Navbar />
        <Admin />
      </div>
    );
  }
  
  // This will rarely be reached due to the redirect in useEffect
  return null;
}

export default App
