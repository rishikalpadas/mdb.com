import React, { useEffect, useState } from 'react'
import './Orders.css'
import { base_url } from '../../Config/config'
import cross_icon from '../../assets/cross_icon.png'
import { CheckCircle, Clock, Eye, Copy, Check } from 'lucide-react';

// Status Indicator Component
const StatusIndicator = ({ isActive }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {isActive ? (
        <CheckCircle className="text-green-500 w-5 h-5" />
      ) : (
        <Clock className="text-amber-500 w-5 h-5" />
      )}
      
      {showTooltip && (
        <div className="absolute bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg">
          {isActive ? 'Active' : 'Inactive'}
        </div>
      )}
    </div>
  );
};

// Copy to Clipboard Component
const CopyButton = ({ text, label = "Copy URL" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${copied ? 'copied' : ''}`}
      title={label}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// Order View Form Component
const OrderViewForm = ({ order, onClose }) => {
  if (!order) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="product-modal-backdrop">
      <div className="product-modal order-modal">
        <div className="product-modal-header">
          <h2>Order Details</h2>
          <button 
            onClick={onClose}
            className="product-modal-close"
          >
            ✕
          </button>
        </div>
        
        <div className="order-info-section">
          <div className="product-form-grid">
            <div className="form-field">
              <label>Order ID</label>
              <input 
                type="text" 
                value={order._id} 
                readOnly
              />
            </div>
            
            <div className="form-field">
              <label>Customer Name</label>
              <input 
                type="text" 
                value={order.name} 
                readOnly
              />
            </div>
            
            <div className="form-field">
              <label>Email</label>
              <input 
                type="text" 
                value={order.email} 
                readOnly
              />
            </div>
            
            <div className="form-field">
              <label>Phone</label>
              <input 
                type="text" 
                value={order.phone} 
                readOnly
              />
            </div>
            
            {/* <div className="form-field">
              <label>Total Amount</label>
              <input 
                type="text" 
                value={`$${order.amount}`} 
                readOnly
              />
            </div> */}
            
            <div className="form-field product-form-fullwidth">
              <label>Transaction ID</label>
              <input 
                type="text" 
                value={order.transactionId} 
                readOnly
              />
            </div>

             
            <div className="form-field product-form-fullwidth">
              <label>Coins Used</label>
              <input 
                type="text" 
                value={order.coins} 
                readOnly
              />
            </div>
            
            <div className="form-field product-form-fullwidth">
              <label>Address</label>
              <input 
                type="text" 
                value={`${order.address}, ${order.city}, ${order.postalCode}`} 
                readOnly
              />
            </div>
            
            <div className="form-field product-form-fullwidth">
              <label>Order Date</label>
              <input 
                type="text" 
                value={formatDate(order.date)} 
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="order-items-section">
          <h3>Order Items</h3>
          <div className="items-container">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-image">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    {/* <p className="item-price">Price: ${item.price}</p>
                    <p className="item-quantity">Quantity: {item.quantity}</p>
                    <p className="item-subtotal">Subtotal: ${item.subtotal}</p> */}
                  </div>
                  
                  <div className="item-image-url">
                    <label>Image URL:</label>
                    <div className="url-container">
                      <input 
                        type="text" 
                        value={item.image} 
                        readOnly
                        className="url-input"
                      />
                      <CopyButton text={item.image} label="Copy Image URL" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="product-modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const config = base_url;
  const [allOrders, setAllOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);

  const fetchInfo = async () => {
    try {
      const userId = localStorage.getItem('id');
      const userRole = localStorage.getItem('role');
      
      let response;
      
      if (userRole === 'Designer') {
        response = await fetch(`${config}/allProducts?user_id=${userId}`);
      } else if (userRole === 'Admin') {
        response = await fetch(`${config}/fetchOrdersForAdmin`);
      } else {
        console.log("Unknown role:", userRole);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAllOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  const handleViewOrder = (order) => {
    setViewOrder(order);
  }

  const handleCloseViewForm = () => {
    setViewOrder(null);
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  return (
    <div className='list-product'>
      <h1>All Orders List</h1>
      <div className="listproduct-format-main">
        {/* Header row for orders */}
        <p>Customer</p>
        <p>Email</p>
        {/* <p>Amount</p> */}
        <p>Items</p>
        <p>Action</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allOrders.map((order, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format">
                <p>{order.name}</p>
                <p>{order.email}</p>
                {/* <p>${order.amount}</p> */}
                <p>{order.items ? order.items.length : 0} item(s)</p>
                
                {/* View Button */}
                <button
                  className="view-product-btn"
                  onClick={() => handleViewOrder(order)}
                  title="View Order"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <hr />
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Order View Form Modal */}
      {viewOrder && (
        <OrderViewForm 
          order={viewOrder} 
          onClose={handleCloseViewForm} 
        />
      )}
    </div>
  )
}

export default Orders