import React, { useState } from 'react';
import { base_url } from '../Config/config';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const config = base_url;
  const [state, setState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Designer",
    // Designer specific fields
    displayName: "",
    mobile: "",
    altmobile: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    panNumber: "",
    gstNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    ifscCode: "",
    upiId: "",
    portfolioLink: "",
    specialization: [],
    // Buyer specific fields
    companyName: "",
    businessType: "",
    paymentMethods: [],
    billingCurrency: "INR",
    designCategories: [],
    purchaseFrequency: "",
    // Agreement checkboxes
    agreements: {
      originalWork: false,
      copyrightPolicy: false,
      monetizationPolicy: false,
      pricingPolicy: false,
      designRules: false,
      minimumDesigns: false,
      licenseUsage: false,
      noCopyrightClaim: false,
      refundPolicy: false,
      noIllegalDesigns: false,
      termsCompliance: false
    }
  });

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('agreements.')) {
        const agreementKey = name.split('.')[1];
        setFormData({
          ...formData,
          agreements: {
            ...formData.agreements,
            [agreementKey]: checked
          }
        });
      } else if (name === 'specialization' || name === 'paymentMethods' || name === 'designCategories') {
        setFormData({
          ...formData,
          [name]: checked 
            ? [...formData[name], value]
            : formData[name].filter(item => item !== value)
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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
  };

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
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormData({ ...formData, role: role });
  };

  const renderRoleSelection = () => (
    <div className="role-selection">
      <h3>Choose Your Account Type</h3>
      <div className="role-cards">
        <div 
          className="role-card"
          onClick={() => handleRoleSelection('Designer')}
        >
          <div className="role-icon">🎨</div>
          <h4>Designer</h4>
          <p>Create and sell designs</p>
        </div>
        <div 
          className="role-card"
          onClick={() => handleRoleSelection('Buyer')}
        >
          <div className="role-icon">🛍️</div>
          <h4>Buyer</h4>
          <p>Purchase designs</p>
        </div>
      </div>
    </div>
  );

  const renderDesignerForm = () => (
    <div className="designer-form">
      <div className="form-header">
        <h2>🖊 Designer Signup Form</h2>
        <button 
          className="back-btn"
          onClick={() => setSelectedRole(null)}
        >
          ← Back
        </button>
      </div>

      <div className="form-section">
        <h3>👤 Personal Information</h3>
        <div className="input-group">
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={changeHandler}
            placeholder="Full Name (as per ID proof)"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="displayName"
            type="text"
            value={formData.display_name}
            onChange={changeHandler}
            placeholder="Display Name / Brand Name (Optional)"
          />
        </div>
        <div className="input-group">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={changeHandler}
            placeholder="Email Address"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={changeHandler}
            placeholder="Mobile Number (with WhatsApp)"
            required
          />
        </div>
         <div className="input-group">
          <input
            name="altmobile"
            type="tel"
            value={formData.alt_mobile}
            onChange={changeHandler}
            placeholder="Alternate Contact Number (Optional)"
            required
          />
        </div>
        <div className="input-group password-group">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={changeHandler}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3>🏠 Address</h3>
        <div className="input-group">
          <input
            name="street"
            type="text"
            value={formData.street}
            onChange={changeHandler}
            placeholder="Street Address"
            required
          />
        </div>
        <div className="input-row input-group">
          <input
            name="city"
            type="text"
            value={formData.city}
            onChange={changeHandler}
            placeholder="City"
            required
          />
          <input
            name="state"
            type="text"
            value={formData.state}
            onChange={changeHandler}
            placeholder="State/Province"
            required
          />
        </div>
        <div className="input-row input-group">
          <input
            name="zipcode"
            type="text"
            value={formData.zipcode}
            onChange={changeHandler}
            placeholder="Zipcode"
            required
          />
          <input
            name="country"
            type="text"
            value={formData.country}
            onChange={changeHandler}
            placeholder="Country"
            required
          />
        </div>
      </div>

<input type="file" placeholder='Upload ID proof' value={formData.govt_id_img} />

      <div className="form-section">
        <h3>📎 Tax Information</h3>
        <div className="input-group">
          <input
            name="panNumber"
            type="text"
            value={formData.pan_no}
            onChange={changeHandler}
            placeholder="PAN Card Number"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="gstNumber"
            type="text"
            value={formData.gst_no}
            onChange={changeHandler}
            placeholder="GST Number (Optional)"
          />
        </div>
      </div>



  <div className="form-section">
        <h3>📎 Bank Details</h3>
        <div className="input-group">
          <input
            name="bank_acc_holder_name"
            type="text"
            value={formData.bank_acc_holder_name}
            onChange={changeHandler}
            placeholder="Bank Account Holder Name"
            
          />
        </div>
        <div className="input-group">
          <input
            name="bank_acc_no"
            type="text"
            value={formData.bank_acc_no}
            onChange={changeHandler}
            placeholder="Bank Account Number"
          />
        </div>
      </div>

  <div className="form-section">
        <h3>📎 Bank Details</h3>
        <div className="input-group">
          <input
            name="bank_name"
            type="text"
            value={formData.bank_name}
            onChange={changeHandler}
            placeholder="Bank Name"
            
          />
        </div>
        <div className="input-group">
          <input
            name="ifsc_code"
            type="text"
            value={formData.ifsc_code}
            onChange={changeHandler}
            placeholder="Bank Account Number"
          />
        </div>
      </div>




      <div className="form-section">
        <h3>💼 Portfolio & Specialization</h3>
        <div className="input-group">
          <input
            name="portfolioLink"
            type="url"
            value={formData.portfolioLink}
            onChange={changeHandler}
            placeholder="Portfolio Link (Behance, Instagram, etc.)"
          />
        </div>
        <div className="checkbox-group">
          <label>Design Specialization:</label>
          <div className="checkbox-options">
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Kidswear"
                onChange={changeHandler}
              />
              Kidswear
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Menswear"
                onChange={changeHandler}
              />
              Menswear
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Womenswear"
                onChange={changeHandler}
              />
              Womenswear
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>🧾 Terms & Agreements</h3>
        <div className="agreement-checkboxes">
          <label>
            <input
              type="checkbox"
              name="agreements.originalWork"
              checked={formData.agreements.originalWork}
              onChange={changeHandler}
            />
            I confirm that all uploaded designs are my original work
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.monetizationPolicy"
              checked={formData.agreements.monetizationPolicy}
              onChange={changeHandler}
            />
            I accept the Revenue Share Agreement (50/50)
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.minimumDesigns"
              checked={formData.agreements.minimumDesigns}
              onChange={changeHandler}
            />
            I agree to upload at least 10 original designs after approval
          </label>
        </div>
      </div>

      <button 
        className="submit-btn"
        onClick={signup}
        disabled={loading}
      >
        {loading ? "Processing..." : "Submit Application"}
      </button>
    </div>
  );

  const renderBuyerForm = () => (
    <div className="buyer-form">
      <div className="form-header">
        <h2>🛍 Buyer Registration Form</h2>
        <button 
          className="back-btn"
          onClick={() => setSelectedRole(null)}
        >
          ← Back
        </button>
      </div>

      <div className="form-section">
        <h3>👤 Personal / Business Information</h3>
        <div className="input-group">
          <input
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={changeHandler}
            placeholder="Full Name / Company Name"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={changeHandler}
            placeholder="Email Address"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={changeHandler}
            placeholder="Mobile Number (with WhatsApp)"
            required
          />
        </div>
        <div className="input-group password-group">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={changeHandler}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <div className="input-group password-group">
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={changeHandler}
            placeholder="Confirm Password"
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h3>📍 Address Information</h3>
        <div className="input-group">
          <input
            name="address"
            type="text"
            value={formData.address}
            onChange={changeHandler}
            placeholder="Street Address"
            required
          />
        </div>
        <div className="input-row">
          <input
            name="city"
            type="text"
            value={formData.city}
            onChange={changeHandler}
            placeholder="City"
            required
          />
          <input
            name="state"
            type="text"
            value={formData.state}
            onChange={changeHandler}
            placeholder="State/Province"
            required
          />
        </div>
        <div className="input-group">
          <select
            name="businessType"
            value={formData.businessType}
            onChange={changeHandler}
          >
            <option value="">Select Business Type</option>
            <option value="Garment Manufacturer">Garment Manufacturer</option>
            <option value="Boutique Owner">Boutique Owner</option>
            <option value="Fashion Brand">Fashion Brand</option>
            <option value="Student">Student / Hobbyist</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>📦 Design Preferences</h3>
        <div className="checkbox-group">
          <label>Design Categories:</label>
          <div className="checkbox-options">
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Kidswear"
                onChange={changeHandler}
              />
              Kidswear
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Menswear"
                onChange={changeHandler}
              />
              Menswear
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Womenswear"
                onChange={changeHandler}
              />
              Womenswear
            </label>
          </div>
        </div>
        <div className="input-group">
          <select
            name="purchaseFrequency"
            value={formData.purchaseFrequency}
            onChange={changeHandler}
          >
            <option value="">Purchase Frequency</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Occasionally">Occasionally</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>✅ Terms & Agreements</h3>
        <div className="agreement-checkboxes">
          <label>
            <input
              type="checkbox"
              name="agreements.licenseUsage"
              checked={formData.agreements.licenseUsage}
              onChange={changeHandler}
            />
            I understand that all downloads are for licensed use only
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.noCopyrightClaim"
              checked={formData.agreements.noCopyrightClaim}
              onChange={changeHandler}
            />
            I agree not to claim copyright on downloaded designs
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.termsCompliance"
              checked={formData.agreements.termsCompliance}
              onChange={changeHandler}
            />
            I agree to comply with all platform terms and policies
          </label>
        </div>
      </div>

      <button 
        className="submit-btn"
        onClick={signup}
        disabled={loading}
      >
        {loading ? "Processing..." : "Create Account"}
      </button>
    </div>
  );

  const renderLoginForm = () => (
    <div className="login-form">
      <div className="form-header">
        <h2>Login</h2>
        <p>Welcome back</p>
      </div>
      
      <div className="loginsignup-fields">
        <div className="input-group">
          <input
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
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
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
        onClick={login}
        disabled={loading}
      >
        {loading ? "Processing..." : "Sign in"}
      </button>
      
      <p className="loginsignup-login">
        Don't have an account? 
        <span onClick={() => setState("Sign Up")}>
          Sign up
        </span>
      </p>
    </div>
  );

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        {state === "Login" && renderLoginForm()}
        {state === "Sign Up" && !selectedRole && renderRoleSelection()}
        {state === "Sign Up" && selectedRole === "Designer" && renderDesignerForm()}
        {state === "Sign Up" && selectedRole === "Buyer" && renderBuyerForm()}
      </div>
    </div>
  );
};

export default LoginSignup;