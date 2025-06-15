import React, { useState } from 'react';
import { base_url } from '../Config/config';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const config = base_url;
  const [state, setState] = useState("Login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [govtIdImg,setGovtIdImg] = useState("");
  const [sampleImg1,setSampleImg1] = useState("");
  const [sampleImg2,setSampleImg2] = useState("");
  const [sampleImg3,setSampleImg3] = useState("");
  const [errors, setErrors] = useState({});



const handleGovtIdUpload = async (e) => {
  const file = e.target.files[0];
  
  const uploadFormData = new FormData();
  uploadFormData.append('product', file);
  
  const response = await fetch(`${config}/upload`, {
    method: 'POST',
    body: uploadFormData,
  });
  
  const result = await response.json();
  console.log('API Response:', result.image_url);
  
  setGovtIdImg(result.image_url);
  
  // Update formData as well
  setFormData(prev => ({
    ...prev,
    govt_id_img: result.image_url
  }));
};

const handleSampleImageUpload1 = async (e) => {
  const file = e.target.files[0];
  
  const uploadFormData = new FormData();
  uploadFormData.append('product', file);
  
  const response = await fetch(`${config}/upload`, {
    method: 'POST',
    body: uploadFormData,
  });
  
  const result = await response.json();
  setSampleImg1(result.image_url);
  
  // Update formData as well
  setFormData(prev => ({
    ...prev,
    sample_img1: result.image_url
  }));
};

const handleSampleImageUpload2 = async (e) => {
  const file = e.target.files[0];
  
  const uploadFormData = new FormData();
  uploadFormData.append('product', file);
  
  const response = await fetch(`${config}/upload`, {
    method: 'POST',
    body: uploadFormData,
  });
  
  const result = await response.json();
  setSampleImg2(result.image_url);
  
  // Update formData as well
  setFormData(prev => ({
    ...prev,
    sample_img2: result.image_url
  }));
};

const handleSampleImageUpload3 = async (e) => {
  const file = e.target.files[0];
  
  const uploadFormData = new FormData();
  uploadFormData.append('product', file);
  
  const response = await fetch(`${config}/upload`, {
    method: 'POST',
    body: uploadFormData,
  });
  
  const result = await response.json();
  setSampleImg3(result.image_url);
  
  // Update formData as well
  setFormData(prev => ({
    ...prev,
    sample_img3: result.image_url
  }));
};
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    email: "",
    mobile: "",
    alt_mobile: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    govt_id_img: "",
    pan_no: "",
    gst_no: "",
    bank_acc_holder_name: "",
    bank_acc_no: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
    paypal_id: "",
    sample_img1: sampleImg1,
    sample_img2: sampleImg2,
    sample_img3: sampleImg3,
    portfolio_link: "",
    specialization: [],
    other_specialization: "",
    password: "",
    confirmPassword: "",
    role: "Designer",
    businessType: "",
    other_business_type: "",
    paymentMethods: [],
    currency:"",
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

  const changeHandlerDropdown = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 
const changeHandler = (e) => {
  const { name, value, type, checked } = e.target;
  
  let updatedFormData = { ...formData };
  
  if (type === 'checkbox') {
    if (name.startsWith('agreements.')) {
      const agreementKey = name.split('.')[1];
      updatedFormData = {
        ...formData,
        agreements: {
          ...formData.agreements,
          [agreementKey]: checked
        }
      };
    } else if (name === 'specialization' || name === 'paymentMethods' || name === 'designCategories') {
      updatedFormData = {
        ...formData,
        [name]: checked 
          ? [...(formData[name] || []), value]
          : (formData[name] || []).filter(item => item !== value)
      };
    }
  } else {
    updatedFormData = { ...formData, [name]: value };
  }
  
  // Update form data
  setFormData(updatedFormData);
  
  // Clear specific field error when user starts typing/selecting
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

// Comprehensive validation function
const validateForm = (role) => {
  const errors = {};
  
  let requiredFields = [];
  
  if (role === 'designer') {
    // Designer-specific required fields only
    requiredFields = [
      'username', 'email', 'mobile', 'password', 
      'street', 'city', 'state', 'zipcode', 'country',
      'alt_mobile', 'pan_no', 'specialization'
    ];
  } else if (role === 'buyer') {
    // Buyer-specific required fields only  
    requiredFields = [
      'username', 'email', 'mobile', 'password', 'confirmPassword',
      'street', 'city', 'state', 'zipcode', 'country',
      'businessType', 'paymentMethods', 'currency', 
      'designCategories', 'purchaseFrequency'
    ];
  }
  
  // Check required fields
  requiredFields.forEach(field => {
    if (Array.isArray(formData[field])) {
      // For array fields (checkboxes)
      if (!formData[field] || formData[field].length === 0) {
        errors[field] = `Please select at least one ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    } else {
      // For string fields
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
      }
    }
  });
  
  // Email validation
  if (formData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }
  
  // Mobile number validation
  if (formData.mobile) {
    const mobileRegex = /^[\+]?[1-9][\d]{9,14}$/;
    if (!mobileRegex.test(formData.mobile.replace(/[\s\-\(\)]/g, ''))) {
      errors.mobile = 'Please enter a valid mobile number';
    }
  }
  
  // Password validation
  if (formData.password) {
    if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
  }
  
  // Buyer-specific validations
  if (role === 'buyer') {
    // Confirm password validation
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    // Other business type validation
    if (formData.businessType === 'Other' && (!formData.other_business_type || formData.other_business_type.trim() === '')) {
      errors.other_business_type = 'Please specify other business type';
    }
    
    // Buyer agreement validations
    const buyerAgreements = ['licenseUsage', 'noCopyrightClaim', 'termsCompliance'];
    buyerAgreements.forEach(agreement => {
      if (!formData.agreements || !formData.agreements[agreement]) {
        errors[`agreements.${agreement}`] = 'This agreement must be accepted';
      }
    });
  }
  
  // Designer-specific validations
  if (role === 'designer') {
    // PAN number validation
    if (formData.pan_no) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_no.toUpperCase())) {
        errors.pan_no = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
      }
    }
    
    // GST number validation (if provided)
    if (formData.gst_no && formData.gst_no.trim() !== '') {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gst_no.toUpperCase())) {
        errors.gst_no = 'Please enter a valid GST number';
      }
    }
    
    // Other specialization validation
    if (formData.specialization && formData.specialization.includes('Others') && 
        (!formData.other_specialization || formData.other_specialization.trim() === '')) {
      errors.other_specialization = 'Please specify other specialization';
    }
    
    // IFSC code validation (if provided)
    if (formData.ifsc_code && formData.ifsc_code.trim() !== '') {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(formData.ifsc_code.toUpperCase())) {
        errors.ifsc_code = 'Please enter a valid IFSC code';
      }
    }
    
    // UPI ID validation (if provided)
    if (formData.upi_id && formData.upi_id.trim() !== '') {
      const upiRegex = /^[\w\.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(formData.upi_id)) {
        errors.upi_id = 'Please enter a valid UPI ID';
      }
    }
    
    // Portfolio link validation (if provided)
    if (formData.portfolioLink && formData.portfolioLink.trim() !== '') {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlRegex.test(formData.portfolioLink)) {
        errors.portfolioLink = 'Please enter a valid URL';
      }
    }
    
    // Designer agreement validations
    const designerAgreements = ['originalWork', 'copyrightPolicy', 'monetizationPolicy', 'pricingPolicy', 'designRules', 'minimumDesigns'];
    designerAgreements.forEach(agreement => {
      if (!formData.agreements || !formData.agreements[agreement]) {
        errors[`agreements.${agreement}`] = 'This agreement must be accepted';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
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
        localStorage.setItem('email', responseData.email);
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
// Updated signup function with validation
// Updated signup function with validation
const signup = async () => {
  // First validate the form
  const { isValid, errors: validationErrors } = validateForm(selectedRole);
  
  if (!isValid) {
    setErrors(validationErrors);
    // Scroll to first error
    const firstErrorField = Object.keys(validationErrors)[0];
    const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                        document.querySelector(`[name="${firstErrorField.replace('.', '\\.')}"]`);
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      errorElement.focus();
    }
    
    // Show detailed error summary
    const errorCount = Object.keys(validationErrors).length;
    const errorList = Object.entries(validationErrors)
      .map(([field, message], index) => `${index + 1}. ${message}`)
      .join('\n');
    
    alert(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting:\n\n${errorList}`);
    return;
  }
  
  // Clear any existing errors
  setErrors({});
  setLoading(true);
  
  let responseData;
  try {
    // Add role to formData before sending
    const dataToSend = {
      ...formData,
      role: selectedRole
    };
    
    const response = await fetch(`${config}/signup`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });
    
    responseData = await response.json();
    
    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      localStorage.setItem('role', responseData.role);
      localStorage.setItem('id', responseData.id);
      localStorage.setItem('username', responseData.name);
      localStorage.setItem('email', responseData.email);
      
      // Success message
      alert(`Account created successfully! Welcome ${responseData.name}`);
      window.location.href = "/";
    } else {
      // Handle server-side validation errors
      if (typeof responseData.errors === 'object') {
        setErrors(responseData.errors);
      } else {
        alert(responseData.errors || 'Registration failed. Please try again.');
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert("Network error occurred. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
};

// Helper function to display errors in JSX
const renderFieldError = (fieldName) => {
  if (errors[fieldName]) {
    return <span className="error-message" style={{color: 'red', fontSize: '12px', display: 'block', marginTop: '4px'}}>{errors[fieldName]}</span>;
  }
  return null;
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
            name="display_name"
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
            name="alt_mobile"
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
      <div className="input-group">
      <h3> Upload ID proof</h3>
<input 
  type="file" 
  placeholder='Upload ID proof' 
  onChange={handleGovtIdUpload}
  accept="image/*"
/>
      </div>
      

      <div className="form-section">
        <h3>📎 Tax Information</h3>
        <div className="input-group">
          <input
            name="pan_no"
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
        <div className="input-group">
          <input
            name="upi_id"
            type="text"
            value={formData.upi_id}
            onChange={changeHandler}
            placeholder="UPI ID"
          />
        </div>
        <div className="input-group">
          <input
            name="paypal_id"
            type="text"
            value={formData.paypal_id}
            onChange={changeHandler}
            placeholder="Paypal ID"
          />
        </div>
      </div>


<div className="input-group">
<h3>Sample Images</h3>
      <label htmlFor="Upload ID proof"> Sample Image 1</label>
<input 
  type="file" 
  placeholder='Upload image' 
  onChange={handleSampleImageUpload1}
  accept="image/*"
/>
<label htmlFor="Upload ID proof"> Sample Image 2</label>
<input 
  type="file" 
  placeholder='Upload image' 
  onChange={handleSampleImageUpload2}
  accept="image/*"
/>


      <label htmlFor="Upload ID proof"> Sample Image 3</label>
<input 
  type="file" 
  placeholder='Upload image' 
  onChange={handleSampleImageUpload3}
  accept="image/*"
/>
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
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Ethnic/Festival"
                onChange={changeHandler}
              />
              Ethnic/Festival
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Floral Patterns"
                onChange={changeHandler}
              />
              Floral Patterns
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Typography"
                onChange={changeHandler}
              />
              Typography
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="AI Generated"
                onChange={changeHandler}
              />
              AI Generated
            </label>
            <label>
              <input
                type="checkbox"
                name="specialization"
                value="Others"
                onChange={changeHandler}
              />
              Others
            </label>
          </div>
        </div>
      </div>

 {/* Conditionally render the "Other Specialization" input */}
      {formData.specialization && formData.specialization.includes("Others") && (
        <div className="input-group">
          <input 
            type="text" 
            name="other_specialization" 
            value={formData.other_specialization} 
            onChange={changeHandler}  
            placeholder='Other Specialization'
          /> 
        </div>
      )}

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
            I confirm that all uploaded designs are my original work and do not infringe any third-party copyrights.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.copyrightPolicy"
              checked={formData.agreements.copyrightPolicy}
              onChange={changeHandler}
            />
            I agree that MyDesignBazaar.com is not responsible for any copyright violation due to my uploads.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.monetizationPolicy"
              checked={formData.agreements.monetizationPolicy}
              onChange={changeHandler}
            />
            I accept the Monetization Policy, Revenue Share Agreement (50/50), and Design Review Terms.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.pricingPolicy"
              checked={formData.agreements.pricingPolicy}
              onChange={changeHandler}
            />
            I understand that pricing of designs is decided by the platform.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.designRules"
              checked={formData.agreements.designRules}
              onChange={changeHandler}
            />
            I acknowledge that designs may be removed if they violate platform rules or receive complaints.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.minimumDesigns"
              checked={formData.agreements.minimumDesigns}
              onChange={changeHandler}
            />
            I agree to upload at least 10 original designs after approval and reach 100 for monetization.
          </label>
        </div>
      </div>

      <button 
        className="submit-btn"
        onClick={signup}
        disabled={loading}
      >
        {loading ? "Processing..." : "Submit"}
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
            name="username"
            type="text"
            value={formData.username}
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
           <input
            name="zipcode"
            type="text"
            value={formData.zipcode}
            onChange={changeHandler}
            placeholder="Postal/ZIP Code"
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
          <input
            name="gst_no"
            type="text"
            value={formData.gst_no}
            onChange={changeHandler}
            placeholder="GST Number"
            
          />
        </div>
        <div className="input-group">
          <select
            name="businessType"
            value={formData.businessType}
            onChange={changeHandler}
            required
          >
            <option value="">Select Business Type</option>
            <option value="Garment Manufacturer">Garment Manufacturer</option>
            <option value="Boutique Owner">Boutique Owner</option>
            <option value="Fashion Brand">Fashion Brand</option>
            <option value="Student">Student / Hobbyist</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {formData.businessType === "Other" && (
           <div className="input-group">
          <input type="text" name="other_business_type" placeholder='Other Business Type' value={formData.other_business_type} onChange={changeHandler}/>
        </div>
        )}
       
      </div>


<div className="form-section">
        <h3>Payment Preferences</h3>
        <div className="checkbox-group">
          <label>Preferred Payment Method:</label>
          <div className="checkbox-options">
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="UPI"
                onChange={changeHandler}
              />
              UPI
            </label>
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="Razorpay"
                onChange={changeHandler}
              />
              Razorpay
            </label>
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="PayPal"
                onChange={changeHandler}
              />
              PayPal
            </label>
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="Credit Card"
                onChange={changeHandler}
              />
              Credit Card
            </label>
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="Debit Card"
                onChange={changeHandler}
              />
              Debit Card
            </label>
            <label>
              <input
                type="checkbox"
                name="paymentMethods"
                value="Net Banking"
                onChange={changeHandler}
              />
              Net Banking
            </label>
          </div>
        </div>
        <div className="input-group">
          <select
            name="currency"
            value={formData.currency}
            onChange={changeHandler}
            required
          >
            <option value="">Billing Currency</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="Others">Others</option>
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
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Festive & Ethnic"
                onChange={changeHandler}
              />
              Festive & Ethnic
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Typography"
                onChange={changeHandler}
              />
              Typography
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Floral / Nature"
                onChange={changeHandler}
              />
              Floral / Nature
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Abstract / Geometric"
                onChange={changeHandler}
              />
              Abstract / Geometric
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Minimal / Modern"
                onChange={changeHandler}
              />
              Minimal / Modern
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="AI Generated"
                onChange={changeHandler}
              />
              AI Generated
            </label>
            <label>
              <input
                type="checkbox"
                name="designCategories"
                value="Custom Design Requests"
                onChange={changeHandler}
              />
              Custom Design Requests
            </label>
          </div>
        </div>
        <div className="input-group">
          <select
            name="purchaseFrequency"
            value={formData.purchaseFrequency}
            onChange={changeHandler}
            required
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
            I understand that all downloads are for licensed use only and resale of the files is strictly prohibited.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.noCopyrightClaim"
              checked={formData.agreements.noCopyrightClaim}
              onChange={changeHandler}
            />
             I agree not to claim copyright on designs downloaded from this platform.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.termsCompliance"
              checked={formData.agreements.termsCompliance}
              onChange={changeHandler}
            />
            I acknowledge that refunds are only available in case of proven file defects or failed downloads.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.refundPolicy"
              checked={formData.agreements.refundPolicy}
              onChange={changeHandler}
            />
            I acknowledge that refunds are only available in case of proven file defects or failed downloads.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.noIllegalDesigns"
              checked={formData.agreements.noIllegalDesigns}
              onChange={changeHandler}
            />
            I will not request or encourage illegal or plagiarized designs.
          </label>
          <label>
            <input
              type="checkbox"
              name="agreements.copyrightPolicy"
              checked={formData.agreements.copyrightPolicy}
              onChange={changeHandler}
            />
            I agree to comply with all applicable copyright, usage, and payment terms as per MyDesignBazaar’s policy.
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