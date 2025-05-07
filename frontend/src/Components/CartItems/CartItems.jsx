import React, { useContext } from 'react';
import './CartItems.css';
import { ShopContext } from '../../Context/ShopContext';

const CartItems = () => {
  const { all_product, cartItems, removeFromCart, getTotalCartAmount } = useContext(ShopContext);
  
  // Filter out products that are in the cart
  const cartProducts = all_product.filter(product => cartItems[product.id] > 0);
  
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
                
                <button className="modern-cart-checkout">Checkout</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartItems;