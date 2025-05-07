import React from 'react';
import './Footer.css';
import footer_logo from '../Assets/logo.png';
import instagram_icon from '../Assets/instagram_icon.png';
import pintester_icon from '../Assets/pintester_icon.png';
import whatsapp_icon from '../Assets/whatsapp_icon.png';

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-top">
        <div className="footer-contact">
          <p><strong>Email:</strong> info@mydesignbazaar.com</p>
          <p><strong>Toll Free:</strong> 1800-11-9999</p>
          <p><strong>WhatsApp:</strong> +91 99999 99999</p>
        </div>

        <div className="footer-section">
          <h4>Company Info</h4>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Testimonials</li>
            <li>Our Offices</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Learn More</h4>
          <ul>
            <li>Pricing</li>
            <li>Licensing</li>
            <li>Terms of Use</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Need Help?</h4>
          <ul>
            <li>Contact Us</li>
            <li>FAQs</li>
            <li>Support</li>
            <li>Search Tips</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-brand">
          <img src={footer_logo} alt="Logo" />
          {/* <p>MY DESIGN BAZAAR</p> */}
        </div>
        <div className="footer-social">
          <img src={instagram_icon} alt="Instagram" />
          <img src={pintester_icon} alt="Pinterest" />
          <img src={whatsapp_icon} alt="WhatsApp" />
        </div>
      </div>

      <hr />

      <div className="footer-legal">
        <p>© 2025 MY DESIGN BAZAAR. A division of PRINTING MADE EASY. All rights reserved.</p>
        <div className="footer-policies">
          <span>Terms of Use</span>
          <span>Privacy Policy</span>
          <span>FAQs</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
