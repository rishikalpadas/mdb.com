import React, { useState } from "react";
import "./PricingPage.css";
import QRCode from "react-qr-code";
import { base_url } from "../../Config/config";
import Tesseract from "tesseract.js"; // Add this import

const PricingPage = () => {
  // State for managing the popup visibility and selected price
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(0);

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle plan selection and open the popup
  const handlePlanClick = (price) => {
    setSelectedPrice(price);
    setShowPopup(true);
  };
  // Function to close the popup
  const handleClosePopup = () => {
  setShowPopup(false);
  setSelectedPrice(0);
  setIsVerified(false);
  setPaymentScreenshot(null);
  setTransactionId("");
  setVerificationMessage("");
  setIsSubmitting(false);
};


  const handleSubmitPayment = async () => {
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
    if (!isVerified) {
      setVerificationMessage("Please verify your payment before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      // API call to add coins
      const response = await fetch(`${base_url}/addCoins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: localStorage.getItem("id"), // Make sure you have userId available in your component
          coins: selectedPrice, // or whatever coin amount you want to add
          subscription: selectedPrice.toString(),
          transactionId: transactionId, // Add transaction ID to the request
        }),
      });

      if (response.ok) {
        alert("Payment Successful");
        setShowPopup(false);
        setSelectedPrice(0);
        setIsVerified(false);
        setPaymentScreenshot(null);
        setTransactionId("");
        setVerificationMessage("");
        window.location.reload();
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to find longest common substring
  const longestCommonSubstring = (str1, str2) => {
    const m = str1.length;
    const n = str2.length;
    let result = "";
    let maxLength = 0;

    // Create a table to store lengths of longest common suffixes
    const dp = Array(m + 1)
      .fill()
      .map(() => Array(n + 1).fill(0));

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

  const handleScreenshotUpload = (e) => {
    setPaymentScreenshot(e.target.files[0]);
    // Reset verification status when a new screenshot is uploaded
    setIsVerified(false);
    setVerificationMessage("");
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
      const potentialIds = tokens.filter(
        (token) =>
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
          const score =
            lcs.length / Math.max(userTransactionId.length, token.length);

          if (score > matchScore && lcs.length >= 4) {
            // At least 4 chars in common
            matchScore = score;
            bestMatchToken = token;
          }
        }

        // Consider a match if similarity is high enough
        if (matchScore >= 0.7) {
          // At least 70% similar
          idMatch = true;
          console.log(
            `High similarity match found: ${bestMatchToken} (score: ${matchScore.toFixed(
              2
            )})`
          );
        }
      }

      // ==== IMPROVED AMOUNT DETECTION ====
      const expectedAmount = selectedPrice;
      let amountMatch = false;
      let bestAmountMatch = null;

      console.log("Looking for amount:", expectedAmount);

      // STEP 1: Try direct number matching first
      // Generate multiple formats of the expected amount
      const amountFormats = [
        expectedAmount.toFixed(2), // 123.45
        Math.floor(expectedAmount).toString(), // 123
        expectedAmount.toString(), // 123.45 or 123
        expectedAmount.toFixed(0), // 123
      ];

      // Also add formats with commas for thousands
      if (expectedAmount >= 1000) {
        const amountWithCommas = expectedAmount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        amountFormats.push(amountWithCommas); // 1,234.56

        const amountWithCommasNoDecimals =
          Math.floor(expectedAmount).toLocaleString("en-US");
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
          /\b([0-9]{3,})\b/g, // Numbers with 3+ digits
        ];

        const foundAmounts = [];

        // Extract all potential amounts from the text
        for (const regex of amountRegexes) {
          let match;
          while ((match = regex.exec(normalizedText)) !== null) {
            if (match[1]) {
              const extractedStr = match[1].trim();
              // Clean up the amount string (remove commas)
              const cleanAmountStr = extractedStr.replace(/,/g, "");
              const extractedAmount = parseFloat(cleanAmountStr);

              if (!isNaN(extractedAmount) && extractedAmount > 0) {
                foundAmounts.push({
                  original: match[0],
                  extracted: extractedAmount,
                  context: normalizedText.substring(
                    Math.max(0, match.index - 20),
                    Math.min(
                      normalizedText.length,
                      match.index + match[0].length + 20
                    )
                  ),
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

          console.log(
            `Comparing ${
              found.extracted
            } with ${expectedAmount}: diff=${difference}, percentDiff=${percentDiff.toFixed(
              2
            )}%`
          );

          // Match if within 2% tolerance
          if (percentDiff <= 2) {
            amountMatch = true;
            bestAmountMatch = found.original;
            console.log(
              `Amount match found: ${found.extracted} (${percentDiff.toFixed(
                2
              )}% diff)`
            );
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
        setVerificationMessage(
          "✅ Payment verified successfully! (Strong verification)"
        );
      } else if (idMatch && matchScore > 0.8) {
        setIsVerified(true);
        setVerificationMessage(
          "✅ Payment verified! Transaction ID confirmed."
        );
      } else if (
        amountMatch &&
        userTransactionId.length >= 6 &&
        /[a-z0-9]{6,}/i.test(userTransactionId)
      ) {
        // Only verify if amount matches AND user entered a complex transaction ID (6+ chars)
        setIsVerified(true);
        setVerificationMessage(
          "✅ Payment amount verified. Please ensure transaction ID is correct."
        );
      } else if (idMatch) {
        // If only ID matches but not amount, still verify but warn
        setIsVerified(true);
        setVerificationMessage(
          "✅ Transaction ID verified! Amount could not be confirmed - please verify the amount is correct."
        );
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

  return (
    <div className="pricing-page">
      <h1>🧾 Subscription Model of MyDesignBazaar.com</h1>
      <div className="pricing-plans">
        <div className="plan basic-plan">
          <h2>🎨 BASIC SUBSCRIPTION PLAN</h2>
          <p>
            Ideal For: Small boutique owners, student startups, and print shops
          </p>
          <p>Price: ₹500/month</p>
          <ul>
            <li>✅ 10 premium design downloads per month</li>
            <li>✅ Validity: 30 days</li>
            <li>✅ Commercial usage rights included</li>
            <li>✅ Email support</li>
            <li>✅ Unused downloads do not roll over</li>
            <li>❌ No access to exclusive/AI designs</li>
          </ul>
          <button
            className="choose-plan-button"
            onClick={() => handlePlanClick(590)}
          >
            Choose This Plan
          </button>
        </div>
        <div className="plan premium-plan">
          <h2>🌟 PREMIUM SUBSCRIPTION PLAN</h2>
          <p>Ideal For: Small-to-medium garment manufacturers & exporters</p>
          <p>Price: ₹1,399/month</p>
          <ul>
            <li>✅ 30 premium design downloads per month</li>
            <li>✅ Validity: 30 days</li>
            <li>✅ Commercial usage rights included</li>
            <li>
              ✅ Access to AI-generated Beta Phase designs (at discounted price:
              ₹299/design)
            </li>
            <li>✅ Priority email & WhatsApp support</li>
            <li>✅ 10% off on pay-per-download items</li>
            <li>✅ Unused downloads do not roll over</li>
            <li>✅ Access to seasonal collection bundles</li>
          </ul>
          <button
            className="choose-plan-button"
            onClick={() => handlePlanClick(1650)}
          >
            Choose This Plan
          </button>
        </div>
        <div className="plan elite-plan">
          <h2>👑 ELITE SUBSCRIPTION PLAN</h2>
          <p>
            Ideal For: Larger production units, online brands, and fashion
            aggregators
          </p>
          <p>Price: ₹2,499/month</p>
          <ul>
            <li>✅ 60 premium design downloads per month</li>
            <li>
              ✅ Full access to AI-generated Beta Phase designs (free: up to
              10/month)
            </li>
            <li>✅ 15% off on Exclusive Designer Uploads</li>
            <li>
              ✅ Direct design request once/month (customizable by selected
              designers)
            </li>
            <li>✅ Validity: 30 days</li>
            <li>✅ Dedicated account manager</li>
            <li>✅ Unused downloads do not roll over</li>
            <li>✅ Priority access to new launches</li>
          </ul>
          <button
            className="choose-plan-button"
            onClick={() => handlePlanClick(2948)}
          >
            Choose This Plan
          </button>
        </div>
        <div className="plan">
          <h2>🛍 PAY-PER-DOWNLOAD (NO SUBSCRIPTION)</h2>
          <p>For buyers who want flexibility without subscribing.</p>
          <table>
            <tr>
              <th>Design Type</th>
              <th>Price per Download</th>
            </tr>
            <tr>
              <td>Premium Standard Design</td>
              <td>₹199</td>
            </tr>
            <tr>
              <td>Exclusive Designer Upload</td>
              <td>₹399</td>
            </tr>
            <tr>
              <td>AI-Generated Beta Phase Design</td>
              <td>₹499</td>
            </tr>
          </table>
          <ul>
            <li>✅ Single-use license</li>
            <li>✅ Valid for commercial use</li>
            <li>❌ No rollovers or refunds</li>
          </ul>
        </div>
        <div className="plan">
          <h2>💼 Bulk or Enterprise Plans (On Request)</h2>
          <p>
            If you require 200+ downloads/month or want to integrate your
            internal design system with our API, we offer enterprise licensing
            and bulk pricing.
          </p>
          <p>📧 Email: info@mydesignbazaar.com</p>
        </div>
      </div>
      <div className="additional-notes">
        <h2>⚙ ADDITIONAL NOTES:</h2>
        <ul>
          <li>
            • All subscriptions are prepaid and auto-renew monthly unless
            canceled.
          </li>
          <li>• All designs come with a standard commercial license.</li>
          <li>
            • Subscription payments are accepted via UPI, Razorpay, Stripe,
            PayPal, and all major credit/debit cards.
          </li>
          <li>• No refunds once designs are downloaded.</li>
        </ul>
      </div>

      {/* Popup for QR Code */}
      {/* {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Scan to Pay: ₹{selectedPrice}</h2>
              <button className="close-popup-button" onClick={handleClosePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <QRCode
                value={`upi://pay?pa=yourupiid@bank&pn=YourName&am=${selectedPrice}&cu=INR`}
                size={180}
              />
              <p>Scan to pay with any UPI app</p>
              <button
                className="confirm-payment-button"
                onClick={handleSubmitPayment}
              >
                Click to Proceed
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Popup for QR Code */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Scan to Pay: ₹{selectedPrice}</h2>
              <button className="close-popup-button" onClick={handleClosePopup}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="qr-section">
                <QRCode
                  value={`upi://pay?pa=yourupiid@bank&pn=YourName&am=${selectedPrice}&cu=INR`}
                  size={180}
                />
                <p>Scan to pay with any UPI app</p>
                <p>
                  After payment, upload screenshot & transaction ID to verify
                </p>
              </div>

              {/* Payment Verification Section */}
              <div className="verification-section">
                {/* Upload Screenshot */}
                <div className="form-group">
                  <label htmlFor="screenshot">Upload Payment Screenshot</label>
                  <input
                    type="file"
                    id="screenshot"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    required
                    className="file-input"
                  />
                  <p className="file-tip">
                    Make sure the screenshot clearly shows the transaction ID
                    and amount
                  </p>
                </div>

                {/* Show Preview (Optional) */}
                {paymentScreenshot && (
                  <div className="screenshot-preview">
                    <img
                      src={URL.createObjectURL(paymentScreenshot)}
                      alt="Payment Screenshot Preview"
                    />
                  </div>
                )}

                {/* Transaction ID */}
                <div className="form-group">
                  <label htmlFor="transactionId">Transaction ID</label>
                  <input
                    type="text"
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    placeholder="Enter your transaction ID"
                  />
                </div>

                {/* Verify Button */}
                <div className="form-group">
                  <button
                    type="button"
                    className="verify-btn"
                    onClick={handleVerifyPayment}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify Payment"}
                  </button>
                </div>

                {/* Verification message */}
                {verificationMessage && (
                  <div
                    className={`verification-message ${
                      isVerified ? "success" : "error"
                    }`}
                  >
                    <p>{verificationMessage}</p>
                  </div>
                )}
              </div>

              <button
                className="confirm-payment-button"
                onClick={handleSubmitPayment}
                disabled={!isVerified || isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : isVerified
                  ? "Confirm Subscription"
                  : "Please Verify Payment First"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
