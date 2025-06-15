import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import { base_url } from '../../Config/config'
import cross_icon from '../../assets/cross_icon.png'
import { CheckCircle, Clock, Eye } from 'lucide-react';

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

// Product View Form Component
const ProductViewForm = ({ product, onClose }) => {
  if (!product) return null;
  const [newPrice, setNewPrice] = useState(product.new_price || 0);
  const [isActive, setIsActive] = useState(product.is_active || false);


   const handleSubmit = async () => {
    try {
      const response = await fetch(`${base_url}/updateProduct`, {
        method: 'PUT', // or 'PUT' based on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: product.id,
          new_price: parseFloat(newPrice),
          is_active: isActive,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Product updated successfully!");
        // onClose(); // Close the modal
        window.location.reload();
      } else {
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Something went wrong while updating.");
    }
  };

  return (
    <div className="product-modal-backdrop">
      <div className="product-modal">
        <div className="product-modal-header">
          <h2>Product Details</h2>
          <button 
            onClick={onClose}
            className="product-modal-close"
          >
            ✕
          </button>
        </div>
        
        <div className="product-modal-image">
          <img 
            src={product.image} 
            alt={product.name} 
          />
        </div>
        
        <div className="product-form-grid">
          <div className="form-field product-form-fullwidth">
            <label>Name</label>
            <input 
              type="text" 
              value={product.name} 
              readOnly
            />
          </div>
          
          <div className="form-field product-form-fullwidth">
            <label>Category</label>
            <input 
              type="text" 
              value={product.category} 
              readOnly
            />
          </div>
          
          {/* <div className="form-field">
            <label>Old Price</label>
            <input 
              type="text" 
              value={`${product.old_price}`} 
              readOnly
            />
          </div> */}
          
          {localStorage.getItem('role') === 'Admin'?
          <div className="form-field product-form-fullwidth">
            <label>Price</label>
            <input 
              type="text" 
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </div>
          :
          <div className="form-field product-form-fullwidth">
            <label>Price</label>
            <input 
              type="text" 
              value={newPrice}
              // onChange={(e) => setNewPrice(e.target.value)}
              readOnly
            />
          </div>
          }
          
          {localStorage.getItem('role') === 'Admin'?
          <div className="form-field product-form-fullwidth">
  <label>Status</label>
  <div className="form-field-status">
    <select 
      value={isActive}
      onChange={(e) => {
        setIsActive(e.target.value);
      }}
      className="status-dropdown"
    >
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </select>
  </div>
</div>
:
  <div className="form-field product-form-fullwidth">
  <label>Status</label>
  <div className="form-field-status">
    <select 
      value={isActive}
      disabled
      className="status-dropdown"
    >
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </select>
  </div>
</div>  
        }
        
          
          {product.description && (
            <div className="form-field product-form-fullwidth">
              <label>Description</label>
              <textarea 
                value={product.description || 'No description available'} 
                readOnly
              />
            </div>
          )}
        </div>
        
        <div className="product-modal-footer">
          {localStorage.getItem('role') === 'Admin'?
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            Submit
          </button>
          :
          <></>
          }
        </div>
      </div>
    </div>
  );
};

const ListProduct = () => {
  const config = base_url;
  const [allproducts, setAllProducts] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);

  const fetchInfo = async () => {
    try {
      const userId = localStorage.getItem('id');
      const userRole = localStorage.getItem('role');
      
      let response;
      
      if (userRole === 'Designer') {
        response = await fetch(`${config}/allProducts?user_id=${userId}`);
      } else if (userRole === 'Admin') {
        response = await fetch(`${config}/fetchProductsForAdmin`);
      } else {
        console.log("Unknown role:", userRole);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const remove_product = async (id) => {
    await fetch(`${config}/removeproduct`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    }).then((resp) => resp.json()).then((data) => {
      if (data.success) {
        fetchInfo();
      } else {
        alert("Product Removing Failed");
      }
    })
  }

  const handleViewProduct = (product) => {
    setViewProduct(product);
  }

  const handleCloseViewForm = () => {
    setViewProduct(null);
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        {/* Header row is commented out in original code */}
        {/* <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p> */}
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <React.Fragment key={index}>
              <div className="listproduct-format-main listproduct-format">
                <img src={product.image} alt="" className='listproduct-product-icon' />
                <p>{product.name}</p>
                {/* <p>${product.old_price}</p> */}
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                
                {/* View Button */}
                <button
                  className="view-product-btn"
                  onClick={() => handleViewProduct(product)}
                  title="View Product"
                >
                  <Eye className="w-5 h-5" />
                </button>
                
                {localStorage.getItem('role') === 'Admin' ? 
                  <img
                    className='listproduct-remove-icon'
                    src={cross_icon}
                    alt=""
                    onClick={() => {remove_product(product.id)}}
                  /> :
                  <></>
                }
                <StatusIndicator isActive={product.is_active} />
              </div>
              <hr />
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Product View Form Modal */}
      {viewProduct && (
        <ProductViewForm 
          product={viewProduct} 
          onClose={handleCloseViewForm} 
        />
      )}
    </div>
  )
}

export default ListProduct