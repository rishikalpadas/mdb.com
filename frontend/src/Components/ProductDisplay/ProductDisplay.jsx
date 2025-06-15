import React, { useContext, useState } from "react"; // Add useState import
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { base_url } from "../../Config/config";
const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  const { coins } = useContext(ShopContext);
  const { subscription } = useContext(ShopContext);

  const [downloadRaw, setDownloadRaw] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    // if (!isVerified) {
    //   setVerificationMessage(
    //     "Please verify your payment before submitting order"
    //   );
    //   return;
    // }

    setIsSubmitting(true);

    // Build items array correctly from cart products
    const orderItems = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.new_price,
      quantity: 1,
      subtotal: (1 * product.new_price).toFixed(2),
    };

    const orderDetails = {
      user_id: localStorage.getItem("id") || "",
      name: localStorage.getItem("username") || "",
      items: orderItems,
      amount: product.new_price,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      postalCode: shippingInfo.postalCode,
      coins:
        subscription === "500" || subscription === 500
          ? 50
          : subscription === "1399" || subscription === 1399
          ? 47
          : subscription === "2499" || subscription === 2499
          ? 42
          : 0,
      email: localStorage.getItem("email") || "",
    };

    try {
      // First, send the email with product images
      // const emailSent = await sendProductImagesEmail();
      // if (!emailSent) {
      //   console.warn(
      //     "Product images email could not be sent, but continuing with order submission"
      //   );
      // }

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

      // Order was successful, now call the removeCoins API
      try {
        const userId = localStorage.getItem("id");
        // Calculate remaining coins after deduction
        const userCurrentCoins = parseInt(localStorage.getItem("coins") || "0");
        const coinsToDeduct =
          subscription === "500" || subscription === 500
            ? 50
            : subscription === "1399" || subscription === 1399
            ? 47
            : subscription === "2499" || subscription === 2499
            ? 42
            : 0;
        const remainingCoins = Math.max(0, coins - coinsToDeduct);

        const coinResponse = await fetch(`${base_url}/removeCoins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: userId,
            coins: remainingCoins,
          }),
        });

        if (!coinResponse.ok) {
          console.warn("Failed to update coins, but order was successful");
        } else {
          // Update coins in localStorage to keep UI in sync
          localStorage.setItem("coins", remainingCoins.toString());
          console.log("Coins updated successfully");
        }
      } catch (coinError) {
        console.error("Error updating coins:", coinError);
        // We don't want to fail the order if coin update fails
      }

      alert(result.message || "Order submitted successfully!");
      setDownloadRaw(true);
      // Redirect to home page
      // window.location.replace("/");
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(`Order submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add state for subscription popup
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: localStorage.getItem("email") || "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle subscription purchase
  const handleSubscriptionPurchase = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Here you would add the API call to process the subscription purchase
      // Similar to the order submission in CartItems.jsx

      // Example:
      // const response = await fetch(`${base_url}/subscriptionPurchase`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //         user_id: localStorage.getItem("id") || "",
      //         product_id: product.id,
      //         product_name: product.name,
      //         coins_used: product.new_price, // Assuming 1 coin = $1
      //         shipping_info: shippingInfo
      //     })
      // });

      // For now, just simulate a successful purchase
      setTimeout(() => {
        alert("Purchase successful! Your item will be shipped soon.");
        setShowSubscriptionPopup(false);
        // Here you would also update the coins balance
      }, 1500);
    } catch (error) {
      console.error("Error processing subscription purchase:", error);
      alert("Failed to process your purchase. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening the popup
  const handleOpenSubscriptionPopup = () => {
    setShowSubscriptionPopup(true);
  };

  // Handle closing the popup
  const handleClosePopup = () => {
    setShowSubscriptionPopup(false);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        {/* Existing left side content */}
        <div className="productdisplay-img-list">
          <img src={product?.image} alt="" />
          <img src={product?.image} alt="" />
          <img src={product?.image} alt="" />
          <img src={product?.image} alt="" />
        </div>
        <div className="productdisplay-img">
          <img
            className="productdisplay-main-img"
            src={product?.image}
            alt=""
          />
        </div>
      </div>
      <div className="productdisplay-right">
        {/* Existing right side content */}
        <h1>{product?.name}</h1>
        <div className="productdisplay-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">
            ${product?.old_price}
          </div>
          <div className="productdisplay-right-price-new">
            ${product?.new_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusantium
          quo numquam cupiditate facere magni, nihil aut recusandae a tempora
          quas inventore doloribus soluta suscipit dicta? Alias dolores
          praesentium nostrum at!
        </div>
        <div className="productdisplay-right-size">
          <h1>Select Size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        {/* Modified button to open popup */}
        {coins > 0 ? (
          <button onClick={handleOpenSubscriptionPopup}>
            Buy with subscription coins
          </button>
        ) : (
          <button onClick={() => addToCart(product.id)}>ADD TO CART</button>
        )}

     
         {downloadRaw ?<a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            try {
              const response = await fetch(product.image, { mode: "cors" });
              const blob = await response.blob();
              const imageBitmap = await createImageBitmap(blob);

              const canvas = document.createElement("canvas");
              canvas.width = imageBitmap.width;
              canvas.height = imageBitmap.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(imageBitmap, 0, 0);

              const watermarkText = "©mdb.com";
              ctx.font = "32px Arial";
              ctx.fillStyle = "black";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const watermarkSpacingX = 300;
              const watermarkSpacingY = 200;
              const rotationAngle = (-30 * Math.PI) / 180; // -30 degrees in radians

              for (let x = -canvas.width; x < canvas.width * 2; x += watermarkSpacingX) {
                for (let y = -canvas.height; y < canvas.height * 2; y += watermarkSpacingY) {
                  ctx.save();
                  ctx.translate(x, y);
                  ctx.rotate(rotationAngle);
                  ctx.fillText(watermarkText, 0, 0);
                  ctx.restore();
                }
              }

              canvas.toBlob(
                (canvasBlob) => {
                  if (canvasBlob) {
                    const url = URL.createObjectURL(canvasBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `product-image-${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
                },
                "image/jpeg",
                0.95
              );
            } catch (error) {
              console.error("Download failed:", error);
              window.open(product.raw_image, "_blank");
            }
          }}
          className="btn btn-primary mt-3"
        >
          Download Raw Image
        </a>:null}

     

        {/* <p className='productdisplay-right-category'><span>Category :</span> Women, T-Shirt, Casual</p>
            <p className='productdisplay-right-category'><span>Tags :</span> Modern, Latest</p> */}
      </div>

      {/* Subscription Popup - Similar to checkout popup */}
      {showSubscriptionPopup && (
        <div className="modern-checkout-overlay">
          <div className="modern-checkout-popup">
            <div className="modern-checkout-header">
              <h2>Complete Your Subscription Purchase</h2>
              <button
                className="modern-close-button"
                onClick={handleClosePopup}
              >
                ×
              </button>
            </div>

            <div className="modern-checkout-content">
              <form
                onSubmit={handleSubscriptionPurchase}
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
                      value={shippingInfo.phone}
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
                      value={shippingInfo.address}
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
                        value={shippingInfo.city}
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
                        value={shippingInfo.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modern-form-section">
                  <h3>Subscription Details</h3>
                  <div className="modern-subscription-summary">
                    <div className="modern-subscription-item">
                      <img src={product.image} alt={product.name} />
                      <div className="modern-subscription-details">
                        <h4>{product.name}</h4>
                        <p>Price: ${product.new_price}</p>
                      </div>
                    </div>

                    <div className="modern-subscription-coins">
                      <p>Your Coins: {coins}</p>
                      {subscription == "500" || subscription == 500 ? (
                        <p>Coins to be used: 50</p>
                      ) : subscription == "1399" || subscription == 1399 ? (
                        <p>Coins to be used: 47</p>
                      ) : subscription == "2499" || subscription == 2499 ? (
                        <p>Coins to be used: 42</p>
                      ) : (
                        <p>Coins to be used: 0 (Debug: {subscription})</p>
                      )}
                      {/* <p>Coins to be used: {coins}</p> */}
                      {/* <p>Remaining Coins: {coins - product.new_price}</p> */}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmitOrder}
                  className="modern-complete-order-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm Purchase"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;
