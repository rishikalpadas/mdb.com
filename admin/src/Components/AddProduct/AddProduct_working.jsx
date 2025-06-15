import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { base_url } from "../../Config/config";

const AddProduct = () => {
  const config = base_url;

  const [products, setProducts] = useState([]);

  // Current product being edited
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    image: "",
    category: "",
    type: "",
    subcategory: "",
    available: true,
    created_by_id: localStorage.getItem("id"),
    created_by_name: localStorage.getItem("username"),
  });

  // For the current product's image
  const [currentImage, setCurrentImage] = useState(false);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    category: false,
    type: false,
    subcategory: false,
  });

  const imageHandler = (e) => {
    setCurrentImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });

    // Clear validation error when field gets a value
    if (
      e.target.name === "category" ||
      e.target.name === "type" ||
      e.target.name === "subcategory"
    ) {
      if (e.target.value !== "") {
        setValidationErrors({ ...validationErrors, [e.target.name]: false });
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newValidationErrors = { ...validationErrors };

    if (currentProduct.category === "") {
      newValidationErrors.category = true;
      isValid = false;
    }

    if (currentProduct.type === "") {
      newValidationErrors.type = true;
      isValid = false;
    }

    if (
      currentProduct.type !== "" &&
      currentProduct.type !== "others" &&
      currentProduct.subcategory === ""
    ) {
      newValidationErrors.subcategory = true;
      isValid = false;
    }

    setValidationErrors(newValidationErrors);

    if (!isValid) {
      let errorMessage = "Please select ";
      const missingFields = [];

      if (newValidationErrors.category) missingFields.push("Category");
      if (newValidationErrors.type) missingFields.push("Type");
      if (newValidationErrors.subcategory) missingFields.push("Subcategory");

      errorMessage += missingFields.join(", ");

      alert(errorMessage);
    }

    return isValid;
  };

  const addProductToList = async () => {
    // Validate before proceeding
    if (!validateForm() || !currentImage) {
      if (!currentImage) {
        alert("Please select an image");
      }
      return;
    }

    let responseData;

    // Upload the image first
    let formData = new FormData();
    formData.append("product", currentImage);

    try {
      const response = await fetch(`${config}/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      responseData = await response.json();

      if (responseData.success) {
        // Add the product to our list with the image URL
        const newProduct = {
          ...currentProduct,
          image: responseData.image_url,
        };

        setProducts([...products, newProduct]);

        // Reset form for next product
        setCurrentProduct({
          name: "",
          image: "",
          category: "",
          type: "",
          subcategory: "",
          available: true,
          created_by_id: localStorage.getItem("id"),
          created_by_name: localStorage.getItem("username"),
        });
        setCurrentImage(false);

        alert("Product added to list");
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    }
  };

  const submitAllProducts = async () => {
    // if (products.length < 1) {
    if (products.length < 10) {
      alert("You need to add at least 10 products before submitting");
      return;
    }

    try {
      const response = await fetch(`${config}/addproduct`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      });

      const data = await response.json();

      if (data.success) {
        alert("All products submitted successfully");
        setProducts([]);
      } else {
        alert("Failed to submit products");
      }
    } catch (error) {
      console.error("Error submitting products:", error);
      alert("Error submitting products");
    }
  };

  const removeProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  return (
    <div className="add-product">
      <h2>Add Products</h2>

      {/* Form for current product */}
      <div className="current-product-form">
        <div className="addproduct-itemfield">
          <p>Product Title</p>
          <input
            value={currentProduct.name}
            onChange={changeHandler}
            type="text"
            name="name"
            placeholder="Type here"
          />
        </div>

        <div className="addproduct-itemfield">
          <p>Product Category</p>
          <select
            value={currentProduct.category}
            onChange={changeHandler}
            name="category"
            className="addproduct-selector"
          >
            <option value="" disabled>
              Select Category
            </option>
            <option value="apparel">Apparel</option>
            <option value="printpattern">Print & Pattern</option>
            <option value="themebased">Theme-Based</option>
            <option value="customizationbased">Customization-Based</option>
            <option value="businessindustryspecific">
              Business & Industry-Specific
            </option>
            {/* <option value="others">Others</option> */}
          </select>
        </div>

        {/*******************************  Conditional Rendering For Product Type ***************************************************/}
        {currentProduct.category === "apparel" ? (
          <div className="addproduct-itemfield">
            <p>Product Type</p>
            <select
              value={currentProduct.type}
              onChange={changeHandler}
              name="type"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="tshirts">T-Shirts</option>
              <option value="hoodiessweatshirts">Hoodies & Sweatshirts</option>
              <option value="jacketsblazers">Jackets & Blazers</option>
              <option value="ethnicwear">Ethnic Wear</option>
              <option value="kidswear">Kidswear</option>
              <option value="sportswearactivewear">
                Sportswear & Activewear
              </option>
              <option value="casualwear">Casual Wear</option>
              <option value="corporatewear">Corporate Wear</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.category === "printpattern" ? (
          <div className="addproduct-itemfield">
            <p>Product Type</p>
            <select
              value={currentProduct.type}
              onChange={changeHandler}
              name="type"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="graphicprints">Graphic Prints</option>
              <option value="typographyquotes">Typography & Quotes</option>
              <option value="floralnature">Floral & Nature</option>
              <option value="animalwildlife">Animal & Wildlife</option>
              <option value="abstractgeometric">Abstract & Geometric</option>
              <option value="culturaltraditional">
                Cultural & Traditional
              </option>
              <option value="plaidcheckered">Plaid & Checkered</option>
              <option value="psychedelictrippy">Psychedelic & Trippy</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.category === "themebased" ? (
          <div className="addproduct-itemfield">
            <p>Product Type</p>
            <select
              value={currentProduct.type}
              onChange={changeHandler}
              name="type"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="summerbeachwear">Summer & Beachwear</option>
              <option value="winterchristmas">Winter & Christmas</option>
              <option value="halloweenhorror">Halloween & Horror</option>
              <option value="valentineromantic">Valentine's & Romantic</option>
              <option value="festivecelebration">Festive & Celebration</option>
              <option value="gamingesports">Gaming & Esports</option>
              <option value="musicpopculture">Music & Pop Culture</option>
              <option value="vintageretro">Vintage & Retro</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.category === "customizationbased" ? (
          <div className="addproduct-itemfield">
            <p>Product Type</p>
            <select
              value={currentProduct.type}
              onChange={changeHandler}
              name="type"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="editablecolorvariations">
                Editable Color Variations
              </option>
              <option value="aigeneratedexclusiveprints">
                AI Generated Exclusive Prints
              </option>
              <option value="scalablevectordesigns">
                Scalable Vector Designs
              </option>
              <option value="mockupsreadytoprintfiles">
                Mockups & Ready-to-Print Files
              </option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.category === "businessindustryspecific" ? (
          <div className="addproduct-itemfield">
            <p>Product Type</p>
            <select
              value={currentProduct.type}
              onChange={changeHandler}
              name="type"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="corporatebranding">Corporate Branding</option>
              <option value="foodbeverage">Food & Beverage</option>
              <option value="fitnessmotivation">Fitness & Motivation</option>
              <option value="entertainmentinfluencermerch">
                Entertainment & Influencer Merch
              </option>
              <option value="traveladventure">Travel & Adventure</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {/************************** *********************** Conditional Rendering for Subcategory *********************************************/}
        {currentProduct.type === "tshirts" ? (
          <div className="addproduct-itemfield">
            <p>Product Subcategory</p>
            <select
              value={currentProduct.subcategory}
              onChange={changeHandler}
              name="subcategory"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="casual">Casual</option>
              <option value="oversized">Oversized</option>
              <option value="graphic">Graphic</option>
              <option value="typography">Typography</option>
              <option value="retro">Retro</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "hoodiessweatshirts" ? (
          <div className="addproduct-itemfield">
            <p>Product Subcategory</p>
            <select
              value={currentProduct.subcategory}
              onChange={changeHandler}
              name="subcategory"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="urban">Urban</option>
              <option value="minimal">Minimal</option>
              <option value="embroidered">Embroidered</option>
              <option value="anime">Anime</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "jacketsblazers" ? (
          <div className="addproduct-itemfield">
            <p>Product Subcategory</p>
            <select
              value={currentProduct.subcategory}
              onChange={changeHandler}
              name="subcategory"
              className="addproduct-selector"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="streetwear">Streetwear</option>
              <option value="denim">Denim</option>
              <option value="bomber">Bomber</option>
              <option value="formal">Formal</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}



        <div className="addproduct-itemfield">
          <label htmlFor="file-input">
            <img
              src={
                currentImage ? URL.createObjectURL(currentImage) : upload_area
              }
              alt=""
              className="addproduct-thumbnail-img"
            />
          </label>
          <input
            onChange={imageHandler}
            type="file"
            name="image"
            id="file-input"
            hidden
          />
        </div>

        <button onClick={addProductToList} className="addproduct-btn">
          Add to List
        </button>
      </div>

      {/* Display products list */}
      {products.length > 0 && (
        <div className="products-list">
          <h3>Products Added ({products.length}/10 minimum)</h3>
          {products.length < 10 && (
            <p style={{ color: 'orange' }}>Add {10 - products.length} more products to enable submission</p>
          )}
          <div className="products-grid">
            {products.map((product, index) => (
              <div key={index} className="product-item">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-thumbnail"
                />
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p>Category: {product.category}</p>
                  <p>Type: {product.type}</p>
                  <p>Subcategory: {product.subcategory}</p>
                </div>
                <button
                  onClick={() => removeProduct(index)}
                  className="remove-product-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {products.length >= 10 && (
          // {products.length >= 1 && (
            <button
              onClick={submitAllProducts}
              className="submit-all-products-btn"
            >
              Submit All Products
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddProduct;
