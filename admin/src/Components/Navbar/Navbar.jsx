import React from 'react'
import './Navbar.css'
import nav_logo from '../../assets/nav-logo.svg'
import nav_profile from '../../assets/nav-profile.svg'
const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={nav_logo} alt="" className='nav-logo'/>
      <button className='nav-button' onClick={() => window.location.href = 'http://localhost:5174/'}>Go to website</button>
      <img src={nav_profile} alt="" className='nav-profile'/>
    </div>
  )
}

export default Navbar
