import React, { useContext, useState } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import QRCode from "react-qr-code";
import { base_url } from "../../Config/config";
import Tesseract from "tesseract.js";

const CartItems = () => {
  const { all_product, cartItems, removeFromCart, getTotalCartAmount } =
    useContext(ShopContext);

  // Filter out products that are in the cart
  const cartProducts = all_product.filter(
    (product) => cartItems[product.id] > 0
  );

  // State for checkout functionality
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: localStorage.getItem("email") || "",
  });

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleScreenshotUpload = (e) => {
    setPaymentScreenshot(e.target.files[0]);
    // Reset verification status when a new screenshot is uploaded
    setIsVerified(false);
    setVerificationMessage("");
  };

  // Helper function to find longest common substring
  const longestCommonSubstring = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    let result = "";
    let maxLength = 0;
    
    // Create a table to store lengths of longest common suffixes
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          
          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            result = str1.substr(i - maxLength, maxLength);
          }
        }
      }
    }
    
    return result;
  };

  const handleVerifyPayment = async () => {
    if (!paymentScreenshot || transactionId.trim() === "") {
      setVerificationMessage(
        "Please upload payment screenshot and enter transaction ID."
      );
      return;
    }

    // Validation: Transaction ID should be at least 4 characters
    if (transactionId.trim().length < 4) {
      setVerificationMessage("Transaction ID must be at least 4 characters.");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("Verifying payment, please wait...");

    try {
      // Perform OCR with improved options
      const {
        data: { text },
      } = await Tesseract.recognize(paymentScreenshot, "eng", {
        logger: (m) => console.log(m),
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.:₹$()/ ",
        tessedit_pageseg_mode: "3", // Fully automatic page segmentation, but no OSD
      });

      console.log("----- OCR Text Start -----");
      console.log(text);
      console.log("----- OCR Text End -----");

      // Normalize OCR text and transaction ID for comparison
      const normalizedText = text.toLowerCase().replace(/\s+/g, " ");
      const userTransactionId = transactionId.trim().toLowerCase();
      
      // Split text into words/tokens for more precise matching
      const tokens = normalizedText.split(/[\s,.:\-\/\\()]+/);
      
      // Extract potential transaction IDs (alphanumeric sequences of reasonable length)
      const potentialIds = tokens.filter(token => 
        token.length >= 4 && // Only consider tokens of reasonable length
        /[a-z0-9]/i.test(token) && // Must contain at least one alphanumeric char
        !/^[0-9]+$/.test(token) // Not just a number (to avoid just matching amounts)
      );
      
      console.log("Potential IDs from OCR:", potentialIds);
      
      // Look for exact or substantial matches
      let idMatch = false;
      let matchScore = 0;
      let bestMatchToken = "";
      
      // 1. Check for exact transaction ID match
      if (normalizedText.includes(userTransactionId)) {
        idMatch = true;
        matchScore = 1.0;
        bestMatchToken = userTransactionId;
        console.log("Exact transaction ID match found");
      } 
      // 2. Check for partial matches with minimum threshold
      else {
        for (const token of potentialIds) {
          // Find longest common substring
          const lcs = longestCommonSubstring(userTransactionId, token);
          const score = lcs.length / Math.max(userTransactionId.length, token.length);
          
          if (score > matchScore && lcs.length >= 4) { // At least 4 chars in common
            matchScore = score;
            bestMatchToken = token;
          }
        }
        
        // Consider a match if similarity is high enough
        if (matchScore >= 0.7) { // At least 70% similar
          idMatch = true;
          console.log(`High similarity match found: ${bestMatchToken} (score: ${matchScore.toFixed(2)})`);
        }
      }
      
      // ==== IMPROVED AMOUNT DETECTION ====
      const expectedAmount = getTotalCartAmount();
      let amountMatch = false;
      let bestAmountMatch = null;
      
      console.log("Looking for amount:", expectedAmount);
      
      // STEP 1: Try direct number matching first
      // Generate multiple formats of the expected amount
      const amountFormats = [
        expectedAmount.toFixed(2),         // 123.45
        Math.floor(expectedAmount).toString(), // 123
        expectedAmount.toString(),         // 123.45 or 123
        expectedAmount.toFixed(0),         // 123
      ];
      
      // Also add formats with commas for thousands
      if (expectedAmount >= 1000) {
        const amountWithCommas = expectedAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        amountFormats.push(amountWithCommas); // 1,234.56
        
        const amountWithCommasNoDecimals = Math.floor(expectedAmount).toLocaleString('en-US');
        amountFormats.push(amountWithCommasNoDecimals); // 1,234
      }
      
      console.log("Amount formats to check:", amountFormats);
      
      // Check all formats
      for (const format of amountFormats) {
        if (normalizedText.includes(format)) {
          amountMatch = true;
          bestAmountMatch = format;
          console.log(`Exact amount match found: ${format}`);
          break;
        }
      }
      
      // STEP 2: If direct matching fails, extract all potential amounts using regex
      if (!amountMatch) {
        // Find all numbers in the OCR text that could be amounts
        const amountRegexes = [
          // Match currency patterns: $123.45, ₹123.45, 123.45$, etc.
          /(?:₹|rs\.?|inr|usd|\$)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
          /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?|inr|usd|\$)/gi,
          
          // Match standalone decimal numbers
          /(?:amount|paid|total|payment|pay)[^\d]+((?:[0-9]{1,3}(?:,|\.)?)+(?:\.[0-9]{1,2})?)/gi,
          
          // Match any decimal number as fallback
          /\b([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{1,2})\b/g,
          /\b([0-9]{3,})\b/g  // Numbers with 3+ digits
        ];
        
        const foundAmounts = [];
        
        // Extract all potential amounts from the text
        for (const regex of amountRegexes) {
          let match;
          while ((match = regex.exec(normalizedText)) !== null) {
            if (match[1]) {
              const extractedStr = match[1].trim();
              // Clean up the amount string (remove commas)
              const cleanAmountStr = extractedStr.replace(/,/g, '');
              const extractedAmount = parseFloat(cleanAmountStr);
              
              if (!isNaN(extractedAmount) && extractedAmount > 0) {
                foundAmounts.push({
                  original: match[0],
                  extracted: extractedAmount,
                  context: normalizedText.substring(
                    Math.max(0, match.index - 20), 
                    Math.min(normalizedText.length, match.index + match[0].length + 20)
                  )
                });
              }
            }
          }
        }
        
        console.log("Found potential amounts:", foundAmounts);
        
        // Check if any found amount matches the expected amount
        for (const found of foundAmounts) {
          const difference = Math.abs(found.extracted - expectedAmount);
          const percentDiff = (difference / expectedAmount) * 100;
          
          console.log(`Comparing ${found.extracted} with ${expectedAmount}: diff=${difference}, percentDiff=${percentDiff.toFixed(2)}%`);
          
          // Match if within 2% tolerance
          if (percentDiff <= 2) {
            amountMatch = true;
            bestAmountMatch = found.original;
            console.log(`Amount match found: ${found.extracted} (${percentDiff.toFixed(2)}% diff)`);
            console.log(`Context: ${found.context}`);
            break;
          }
        }
      }
      
      // Debug logs
      console.log("User Transaction ID:", userTransactionId);
      console.log("Transaction ID match:", idMatch, "with score:", matchScore);
      console.log("Expected amount:", expectedAmount);
      console.log("Amount match:", amountMatch, "best match:", bestAmountMatch);
      
      // Verification logic: 
      // - Strong verification: Both ID and amount match
      // - Medium verification: ID matches strongly (exact or high similarity)
      // - Weak verification: Only amount matches, must have entered a complex transaction ID
      if (idMatch && amountMatch) {
        setIsVerified(true);
        setVerificationMessage("✅ Payment verified successfully! (Strong verification)");
      } else if (idMatch && matchScore > 0.8) {
        setIsVerified(true);
        setVerificationMessage("✅ Payment verified! Transaction ID confirmed.");
      } else if (amountMatch && userTransactionId.length >= 6 && /[a-z0-9]{6,}/i.test(userTransactionId)) {
        // Only verify if amount matches AND user entered a complex transaction ID (6+ chars)
        setIsVerified(true);
        setVerificationMessage("✅ Payment amount verified. Please ensure transaction ID is correct.");
      } else if (idMatch) {
        // If only ID matches but not amount, still verify but warn
        setIsVerified(true);
        setVerificationMessage("✅ Transaction ID verified! Amount could not be confirmed - please verify the amount is correct.");
      } else {
        setIsVerified(false);
        setVerificationMessage(
          "❌ Payment verification failed. Please check your transaction ID and ensure the screenshot clearly shows payment details."
        );
      }
    } catch (error) {
      console.error("Error reading payment screenshot:", error);
      setVerificationMessage(
        "❌ Failed to verify payment. Please try again with a clearer image."
      );
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
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
    setVerificationMessage("");
    setCheckoutData({
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      email: localStorage.getItem("email") || "",
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
      images: productImages,
    };

    try {
      const response = await fetch(`${base_url}/sendImagesEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
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

    if (!isVerified) {
      setVerificationMessage(
        "Please verify your payment before submitting order"
      );
      return;
    }

    setIsSubmitting(true);

    // Build items array correctly from cart products
    const orderItems = cartProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.new_price,
      quantity: cartItems[product.id],
      subtotal: (cartItems[product.id] * product.new_price).toFixed(2)
    }));

    const orderDetails = {
      user_id: localStorage.getItem("id") || "",
      name: localStorage.getItem("username") || "",
      items: orderItems,
      amount: getTotalCartAmount(),
      phone: checkoutData.phone,
      address: checkoutData.address,
      city: checkoutData.city,
      postalCode: checkoutData.postalCode,
      transactionId: transactionId,
      email: localStorage.getItem("email") || "",
    };

    try {
      // First, send the email with product images
      const emailSent = await sendProductImagesEmail();
      if (!emailSent) {
        console.warn(
          "Product images email could not be sent, but continuing with order submission"
        );
      }

      console.log("Submitting order to:", `${base_url}/addOrder`);
      console.log("Order details:", JSON.stringify(orderDetails));

      const response = await fetch(`${base_url}/addOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json", // Explicitly request JSON response
        },
        body: JSON.stringify(orderDetails),
      });

      // Improved error handling for server responses
      let responseText;
      let result;

      try {
        // First try to get the raw text
        responseText = await response.text();

        // Then try to parse it as JSON
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Response is not valid JSON:", responseText);
          throw new Error(
            "Server returned invalid response format. Please contact support."
          );
        }
      } catch (error) {
        console.error("Error reading response:", error);
        throw new Error("Failed to read server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`);
      }

      alert(result.message || "Order submitted successfully!");

      // Redirect to home page
      window.location.replace("/");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(`Order submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modern-cart">
      <h1 className="modern-cart-title">Your Shopping Cart</h1>

      {cartProducts.length === 0 ? (
        <div className="modern-cart-empty">
          <p>Your cart is empty</p>
          <button className="modern-cart-continue-shopping">
            Continue Shopping
          </button>
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
                    <img
                      src={product.image}
                      alt={product.name}
                      className="modern-cart-product-image"
                    />
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
              <button
                className="modern-close-button"
                onClick={handleClosePopup}
              >
                ×
              </button>
            </div>

            <div className="modern-checkout-content">
              <form
                onSubmit={handleSubmitOrder}
                className="modern-checkout-form"
              >
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
                    <p>
                      After payment, upload screenshot & transaction ID to
                      verify
                    </p>
                  </div>

                  {/* Upload Screenshot */}
                  <div className="modern-form-group">
                    <label htmlFor="screenshot">
                      Upload Payment Screenshot
                    </label>
                    <input
                      type="file"
                      id="screenshot"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      required
                      className="modern-file-input"
                    />
                    <p className="modern-file-tip">
                      Make sure the screenshot clearly shows the transaction ID
                      and amount
                    </p>
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
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify Payment"}
                    </button>
                  </div>

                  {/* Verification message */}
                  {verificationMessage && (
                    <div
                      className={`modern-verification-message ${
                        isVerified ? "success" : "error"
                      }`}
                    >
                      <p>{verificationMessage}</p>
                    </div>
                  )}

                  {emailSent && (
                    <div className="modern-email-confirmation">
                      <p>
                        ✅ Product images email has been sent to your email
                        address
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="modern-complete-order-btn"
                  disabled={!isVerified || isSubmitting}
                >
                  {isSubmitting
                    ? "Processing..."
                    : isVerified
                    ? "Complete Order"
                    : "Please Verify Payment First"}
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