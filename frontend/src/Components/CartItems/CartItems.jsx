import React, { useContext, useState } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';
import QRCode from "react-qr-code";
import { base_url } from "../../Config/config";
import Tesseract from "tesseract.js";

const CartItems = () => {
  const { all_product, cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  
  // Filter out products that are in the cart
  const cartProducts = all_product.filter(product => cartItems[product.id] > 0);

  // State for checkout functionality
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: localStorage.getItem("email"),
  });

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleScreenshotUpload = (e) => {
    setPaymentScreenshot(e.target.files[0]);
  };

  const handleVerifyPayment = async () => {
    if (!paymentScreenshot || transactionId.trim() === "") {
      alert("Please upload payment screenshot and enter transaction ID.");
      return;
    }

    try {
      const { data: { text } } = await Tesseract.recognize(
        paymentScreenshot,
        'eng',
        { logger: m => console.log(m) }
      );

      console.log("----- OCR Text Start -----");
      console.log(text);
      console.log("----- OCR Text End -----");

      // For debugging purposes - show what was found in the image
      const normalizedText = text.toLowerCase();
      
      // More flexible transaction ID extraction - look for patterns
      let txnIdFromImage = null;
      
      // Try multiple regex patterns to find transaction ID
      const txnPatterns = [
        /(txn|transaction)\s*id[:\s]*([A-Za-z0-9]+)/i,
        /(reference|ref)\s*(no|number)?[:\s]*([A-Za-z0-9]+)/i,
        /(utr|utr\s*no)[:\s]*([A-Za-z0-9]+)/i,
        /([A-Z0-9]{10,})/   // Look for any sequence of 10+ alphanumeric chars as fallback
      ];
      
      for (const pattern of txnPatterns) {
        const match = text.match(pattern);
        if (match) {
          // Different patterns have the ID in different capture groups
          txnIdFromImage = pattern === txnPatterns[1] || pattern === txnPatterns[2] 
            ? match[3]?.trim() 
            : (pattern === txnPatterns[0] ? match[2]?.trim() : match[1]?.trim());
          
          if (txnIdFromImage) {
            console.log(`Found transaction ID using pattern: ${pattern}`);
            break;
          }
        }
      }

      console.log("Extracted Transaction ID:", txnIdFromImage);
      console.log("User entered Transaction ID:", transactionId.trim());

      // More flexible amount extraction
      let amountFromImage = null;
      
      // Look for amount patterns
      const amountPatterns = [
        // Look for currency symbol or word followed by number
        /(?:₹|rs\.?|inr)\s*(\d+(?:[,.]\d+)?)/i,
        // Look for "amount" followed by number
        /amount[:\s]*(\d+(?:[,.]\d+)?)/i,
        // Look for "paid" or "transferred" and nearby numbers
        /(?:paid|transferred)[:\s]*(\d+(?:[,.]\d+)?)/i
      ];
      
      for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          // Remove commas from the number and convert to float
          amountFromImage = parseFloat(match[1].replace(/,/g, ''));
          console.log(`Found amount using pattern: ${pattern}`);
          break;
        }
      }
      
      // If still not found, search for numbers near keywords
      if (!amountFromImage) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line !== "");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes('transferred') || 
              lines[i].toLowerCase().includes('paid') || 
              lines[i].toLowerCase().includes('amount')) {
            // Check this line and 3 lines before/after for numbers
            for (let j = Math.max(0, i-3); j <= Math.min(lines.length-1, i+3); j++) {
              const numMatch = lines[j].match(/(\d+(?:[,.]\d+)?)/);
              if (numMatch) {
                amountFromImage = parseFloat(numMatch[1].replace(/,/g, ''));
                console.log(`Found amount near keyword in line: ${lines[j]}`);
                break;
              }
            }
            if (amountFromImage) break;
          }
        }
      }

      console.log("Extracted Amount:", amountFromImage);
      console.log("Expected Amount:", getTotalCartAmount());

      // More flexible verification
      const isAmountMatching = amountFromImage 
        ? Math.abs(amountFromImage - getTotalCartAmount()) < 0.01 // Allow tiny floating point differences
        : false;
        
      // For transaction ID, be more lenient in comparison
      const isIdMatching = txnIdFromImage 
        ? txnIdFromImage.toLowerCase().includes(transactionId.trim().toLowerCase()) || 
          transactionId.trim().toLowerCase().includes(txnIdFromImage.toLowerCase())
        : false;
        
      console.log("Amount matching:", isAmountMatching);
      console.log("ID matching:", isIdMatching);

      // For testing purposes - accept if either matches or force accept
      // setIsVerified(true); // Uncomment to force verification for testing
      
      if (isAmountMatching || isIdMatching) {
        setIsVerified(true);
        alert("✅ Payment verification successful!");
      } else if (!txnIdFromImage && !amountFromImage) {
        // If neither found, OCR probably failed
        alert("❓ Could not extract payment details from image. For testing purposes, you can proceed. In production, please contact support.");
        setIsVerified(true); // For testing only - remove in production
      } else {
        setIsVerified(false);
        alert("❌ Payment details do not match. Please check the screenshot and transaction ID.");
      }
    } catch (error) {
      console.error("Error reading payment screenshot:", error);
      alert("Failed to verify payment. Please try again.");
    }
  };

  const handleProceedCheckout = () => {
    setShowCheckout(true);
  };

  const handleClosePopup = () => {
    setShowCheckout(false);
    setIsVerified(false);
    setPaymentScreenshot(null);
    setTransactionId("");
    setEmailSent(false);
    setIsSubmitting(false);
    setCheckoutData({
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      email: localStorage.getItem("email"),
    });
  };

  const sendProductImagesEmail = async () => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      console.error("User email not found in localStorage");
      return false;
    }

    // Collect all product images from cart items
    const productImages = [];
    all_product.forEach((product) => {
      if (cartItems[product.id] > 0) {
        // Assuming product.image contains the full image URL
        productImages.push(product.image);
      }
    });

    if (productImages.length === 0) {
      console.error("No product images found in cart");
      return false;
    }

    const emailPayload = {
      email: userEmail,
      images: productImages
    };

    try {
      const response = await fetch(`${base_url}/sendImagesEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload)
      });

      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      // Try to parse JSON response
      try {
        const result = await response.json();
        console.log("Email with product images sent successfully!");
        setEmailSent(true);
        return true;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        return false;
      }
    } catch (error) {
      console.error("Error sending product images email:", error);
      return false;
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    
    setIsSubmitting(true);

    const orderDetails = {
      user_id: localStorage.getItem("id"),
      name: localStorage.getItem("username"),
      items: cartItems,
      amount: getTotalCartAmount(),
      phone: checkoutData.phone,
      address: checkoutData.address,
      city: checkoutData.city,
      postalCode: checkoutData.postalCode,
      transactionId: transactionId,
      email: localStorage.getItem("email"),
    };

    try {
      // First, send the email with product images
      const emailSent = await sendProductImagesEmail();
      if (!emailSent) {
        console.warn("Product images email could not be sent, but continuing with order submission");
      }

      console.log("Submitting order to:", `${base_url}/addOrder`);
      console.log("Order details:", JSON.stringify(orderDetails));
      
      const response = await fetch(`${base_url}/addOrder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDetails),
      });

      // First check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        const responseText = await response.text();
        console.log("Response text:", responseText);
        throw new Error("Server returned invalid JSON. Please contact support.");
      }

      alert(result.message || "Order submitted successfully!");
      
      // Redirect to home page
      window.location.replace("/");

    } catch (error) {
      console.error("Error submitting order:", error);
      alert(error.message || "There was an error submitting your order. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowCheckout(false);
    }
  };

  return (
    <div className="modern-cart">
      <h1 className="modern-cart-title">Your Shopping Cart</h1>
      
      {cartProducts.length === 0 ? (
        <div className="modern-cart-empty">
          <p>Your cart is empty</p>
          <button className="modern-cart-continue-shopping">Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="modern-cart-content">
            <div className="modern-cart-items">
              <div className="modern-cart-header">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Action</span>
              </div>
              
              {cartProducts.map((product) => (
                <div className="modern-cart-item" key={product.id}>
                  <div className="modern-cart-product">
                    <img src={product.image} alt={product.name} className="modern-cart-product-image" />
                    <div className="modern-cart-product-details">
                      <h3>{product.name}</h3>
                      <p className="modern-cart-product-id">ID: {product.id}</p>
                    </div>
                  </div>
                  
                  <div className="modern-cart-price">${product.new_price}</div>
                  
                  <div className="modern-cart-quantity">
                    <span>{cartItems[product.id]}</span>
                  </div>
                  
                  <div className="modern-cart-subtotal">
                    ${(cartItems[product.id] * product.new_price).toFixed(2)}
                  </div>
                  
                  <button 
                    className="modern-cart-remove"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="modern-cart-summary-container">
              <div className="modern-cart-promo">
                <h3>Promo Code</h3>
                <div className="modern-cart-promo-input">
                  <input type="text" placeholder="Enter your code" />
                  <button>Apply</button>
                </div>
              </div>
              
              <div className="modern-cart-summary">
                <h2>Order Summary</h2>
                
                <div className="modern-cart-summary-row">
                  <span>Subtotal</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                
                <div className="modern-cart-summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="modern-cart-summary-row modern-cart-total">
                  <span>Total</span>
                  <span>${getTotalCartAmount().toFixed(2)}</span>
                </div>
                
                <button 
                  className="modern-cart-checkout"
                  onClick={handleProceedCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Checkout Popup - Modern Styled */}
      {showCheckout && (
        <div className="modern-checkout-overlay">
          <div className="modern-checkout-popup">
            <div className="modern-checkout-header">
              <h2>Complete Your Order</h2>
              <button className="modern-close-button" onClick={handleClosePopup}>
                ×
              </button>
            </div>
            
            <div className="modern-checkout-content">
              <form onSubmit={handleSubmitOrder} className="modern-checkout-form">
                <div className="modern-form-section">
                  <h3>Shipping Information</h3>
                  
                  <div className="modern-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={checkoutData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="modern-form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={checkoutData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="modern-form-row">
                    <div className="modern-form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={checkoutData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="modern-form-group">
                      <label htmlFor="postalCode">Postal Code</label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={checkoutData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modern-form-section">
                  <h3>Payment</h3>
                  
                  {/* QR Code Section */}
                  <div className="modern-qr-section">
                    <h3>Scan to Pay: ${getTotalCartAmount().toFixed(2)}</h3>
                    <div className="modern-qr-code">
                      <QRCode
                        value={`upi://pay?pa=payaladhikary2000-2@okhdfcbank&pn=Payal%20Adhikary&am=${getTotalCartAmount()}&cu=INR`}
                        size={180}
                      />
                    </div>
                    <p>Scan to pay with any UPI app</p>
                    <p>After payment, upload screenshot & transaction ID to verify</p>
                  </div>

                  {/* Upload Screenshot */}
                  <div className="modern-form-group">
                    <label htmlFor="screenshot">Upload Payment Screenshot</label>
                    <input
                      type="file"
                      id="screenshot"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      required
                      className="modern-file-input"
                    />
                    <p className="modern-file-tip">Make sure the screenshot clearly shows the transaction ID and amount</p>
                  </div>

                  {/* Show Preview (Optional) */}
                  {paymentScreenshot && (
                    <div className="modern-screenshot-preview">
                      <img
                        src={URL.createObjectURL(paymentScreenshot)}
                        alt="Payment Screenshot Preview"
                      />
                    </div>
                  )}

                  {/* Transaction ID */}
                  <div className="modern-form-group">
                    <label htmlFor="transactionId">Transaction ID</label>
                    <input
                      type="text"
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                    />
                  </div>

                  {/* Verify Button */}
                  <div className="modern-form-group">
                    <button 
                      type="button" 
                      className="modern-verify-btn" 
                      onClick={handleVerifyPayment}
                    >
                      Verify Payment
                    </button>
                  </div>

                  {emailSent && (
                    <div className="modern-email-confirmation">
                      <p>✅ Product images email has been sent to your email address</p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="modern-complete-order-btn"
                  disabled={!isVerified || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : (isVerified ? "Complete Order" : "Please Verify Payment First")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;