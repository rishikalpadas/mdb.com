import React, { useState } from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import { base_url } from "../../Config/config";
import { useEffect } from "react";

const AddProduct = () => {
  const config = base_url;

  const [products, setProducts] = useState([]);
  const [productCount,setProductCount] = useState(0);

  // Current product being edited
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    image: "",
    raw_image: "",
    category: "",
    type: "",
    subcategory: "",
    available: true,
    created_by_id: localStorage.getItem("id"),
    created_by_name: localStorage.getItem("username"),
  });

  // For the current product's image
  const [currentImage, setCurrentImage] = useState(false);
  const [rawImage, setRawImage] = useState(false);

  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    category: false,
    type: false,
    subcategory: false,
  });

  const imageHandler = (e) => {
    setCurrentImage(e.target.files[0]);
  };

  const imageHandler1 = (e) => {
    setRawImage(e.target.files[0]);
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
  if (!validateForm() || !currentImage ) {
    if (!currentImage) {
      alert("Please select an image");
    }
    return;
  }

  let responseData;
  let responseData1;

  // Upload the first image
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

    // Upload the raw image
    let formData1 = new FormData();
    formData1.append("product", rawImage);
    
    try {
      const response1 = await fetch(`${config}/upload`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData1,
      });
      
      responseData1 = await response1.json();

      if (responseData.success && responseData1.success) {
        // Add the product to our list with both image URLs
        const newProduct = {
          ...currentProduct,
          image: responseData.image_url, // Assuming the backend returns this
          raw_image: responseData1.image_url, // Assuming the backend returns this
        };

        console.log(responseData);
        console.log(responseData1);
        setProducts([...products, newProduct]);

        // Reset form for next product
        setCurrentProduct({
          name: "",
          image: "",
          raw_image: "",
          category: "",
          type: "",
          subcategory: "",
          available: true,
          created_by_id: localStorage.getItem("id"),
          created_by_name: localStorage.getItem("username"),
        });
        
        setCurrentImage(false);
        setRawImage(false);

        alert("Product added to list");
      } else {
        alert("Failed to upload one or both images");
      }
    } catch (error) {
      console.error("Error uploading raw image:", error);
      alert("Error uploading raw image");
    }
  } catch (error) {
    console.error("Error uploading main image:", error);
    alert("Error uploading main image");
  }
};
  
const getProductCount = async () => {
  try {
    const response = await fetch(`${config}/getProductCount`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: localStorage.getItem("id") }), // Make sure userId is available in scope
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product count");
    }

    const data = await response.json();
    setProductCount(data.count);
  } catch (error) {
    console.error("Error fetching product count:", error);
    alert("Error fetching product count");
  }
}
const submitAllProducts = async () => {
  try {
    // First, get the current product count for this user
    const countResponse = await fetch(`${config}/getProductCount`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: localStorage.getItem("id") }), // Make sure userId is available in scope
    });
    setProductCount(countResponse.count);
    const countData = await countResponse.json();
    
    if (!countResponse.ok) {
      alert("Error checking existing products");
      return;
    }

    const existingProductCount = countData.count;
    console.log("Existing product count:", existingProductCount);

    // Check minimum requirements based on existing products
    if (existingProductCount === 0) {
      // First time submission - need at least 10 products
      if (products.length < 10) {
        alert("You need to add at least 10 products for your first submission");
        return;
      }
    } else {
      // Already has products - need at least 1 product
      if (products.length < 1) {
        alert("You need to add at least 1 product to submit");
        return;
      }
    }

    // Submit the products
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
useEffect(() => {
  getProductCount();
}, []);
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

        {currentProduct.type === "ethnicwear" ? (
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
              <option value="sareeprints">Saree Prints</option>
              <option value="kurtapatterns">Kurta Patterns</option>
              <option value="dupattadesigns">Dupatta Designs</option>
              {/* <option value="formal">Formal</option> */}
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "kidswear" ? (
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
              <option value="cartoon">Cartoon</option>
              <option value="cutepatterns">Cute Patterns</option>
              <option value="nurseryprints">Nursery Prints</option>
              {/* <option value="formal">Formal</option> */}
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "sportswearactivewear" ? (
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
              <option value="fitness">Fitness</option>
              <option value="athleisure">Athleisure</option>
              <option value="jerseydesigns">Jersey Designs</option>
              {/* <option value="formal">Formal</option> */}
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "casualwear" ? (
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
              <option value="polo">Polo</option>
              <option value="halfsleeve">Half-sleeve</option>
              <option value="fullsleeve">Full-sleeve</option>
              <option value="vintage">Vintage</option>
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "corporatewear" ? (
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
              <option value="uniforms">Uniforms</option>
              <option value="poloshirts">Polo Shirts</option>
              <option value="eventtees">Event Tees</option>
              {/* <option value="vintage">Vintage</option> */}
              {/* <option value="others">Others</option> */}
            </select>
          </div>
        ) : null}

        {currentProduct.type === "graphicprints" ? (
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
      <option value="artistic">Artistic</option>
      <option value="digital">Digital</option>
      <option value="conceptual">Conceptual</option>
      <option value="illustrations">Illustrations</option>
    </select>
  </div>
) : null}

{currentProduct.type === "typography" ? (
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
      <option value="motivational">Motivational</option>
      <option value="funny">Funny</option>
      <option value="minimal">Minimal</option>
      <option value="calligraphy">Calligraphy</option>
    </select>
  </div>
) : null}

{currentProduct.type === "floralnature" ? (
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
      <option value="botanical">Botanical</option>
      <option value="watercolor">Watercolor</option>
      <option value="abstractleaves">Abstract Leaves</option>
    </select>
  </div>
) : null}

{currentProduct.type === "animalwildlife" ? (
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
      <option value="leopard">Leopard</option>
      <option value="tiger">Tiger</option>
      <option value="birds">Birds</option>
      <option value="jungle">Jungle</option>
    </select>
  </div>
) : null}

{currentProduct.type === "abstractgeometric" ? (
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
      <option value="futuristic">Futuristic</option>
      <option value="lineart">Line Art</option>
      <option value="opticalillusions">Optical Illusions</option>
    </select>
  </div>
) : null}

{currentProduct.type === "culturaltraditional" ? (
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
      <option value="indian">Indian</option>
      <option value="japanese">Japanese</option>
      <option value="tribal">Tribal</option>
      <option value="boho">Boho</option>
    </select>
  </div>
) : null}

{currentProduct.type === "plaidcheckered" ? (
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
      <option value="classic">Classic</option>
      <option value="scottish">Scottish</option>
      <option value="modernvariations">Modern Variations</option>
    </select>
  </div>
) : null}

{currentProduct.type === "psychedelictrippy" ? (
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
      <option value="vibrant">Vibrant</option>
      <option value="opticalwaves">Optical Waves</option>
      <option value="gradientmagic">Gradient Magic</option>
    </select>
  </div>
) : null}

{currentProduct.type === "summerbeachwear" ? (
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
      <option value="tropical">Tropical</option>
      <option value="hawaiian">Hawaiian</option>
      <option value="sunsetprints">Sunset Prints</option>
    </select>
  </div>
) : null}

{currentProduct.type === "winterchristmas" ? (
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
      <option value="snowflakes">Snowflakes</option>
      <option value="reindeer">Reindeer</option>
      <option value="cozythemes">Cozy Themes</option>
    </select>
  </div>
) : null}

{currentProduct.type === "halloweenhorror" ? (
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
      <option value="skulls">Skulls</option>
      <option value="witches">Witches</option>
      <option value="darkaesthetic">Dark Aesthetic</option>
    </select>
  </div>
) : null}

{currentProduct.type === "valentineromantic" ? (
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
      <option value="hearts">Hearts</option>
      <option value="lovequotes">Love Quotes</option>
      <option value="cutedoodles">Cute Doodles</option>
    </select>
  </div>
) : null}

{currentProduct.type === "festivecelebration" ? (
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
      <option value="diwali">Diwali</option>
      <option value="eid">Eid</option>
      <option value="newyear">New Year</option>
      <option value="holiprints">Holi Prints</option>
    </select>
  </div>
) : null}

{currentProduct.type === "gamingesports" ? (
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
      <option value="pixelart">Pixel Art</option>
      <option value="consoleinspired">Console-Inspired</option>
      <option value="cyberpunk">Cyberpunk</option>
    </select>
  </div>
) : null}

{currentProduct.type === "musicpopculture" ? (
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
      <option value="bandtees">Band Tees</option>
      <option value="dj">DJ</option>
      <option value="retrocassette">Retro Cassette</option>
    </select>
  </div>
) : null}

{currentProduct.type === "vintageretro" ? (
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
      <option value="80s90s">80s & 90s</option>
      <option value="oldschool">Old School</option>
      <option value="neonvibes">Neon Vibes</option>
    </select>
  </div>
) : null}

{currentProduct.type === "editablecolorvariations" ? (
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
      <option value="modifiablecolor">Modifiable Color Schemes</option>
      {/* <option value="oldschool">Old School</option> */}
      {/* <option value="neonvibes">Neon Vibes</option> */}
    </select>
  </div>
) : null}

{currentProduct.type === "aigeneratedexclusiveprints" ? (
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
      <option value="unique">Unique, One-of-a-Kind Creations</option>
      {/* <option value="oldschool">Old School</option> */}
      {/* <option value="neonvibes">Neon Vibes</option> */}
    </select>
  </div>
) : null}

{currentProduct.type === "scalablevectordesigns" ? (
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
      <option value="differentprintsize">For different print sizes without loss</option>
      {/* <option value="oldschool">Old School</option> */}
      {/* <option value="neonvibes">Neon Vibes</option> */}
    </select>
  </div>
) : null}

{currentProduct.type === "mockupsreadytoprintfiles" ? (
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
      <option value="printingease">Pre-set for printing ease</option>
      {/* <option value="oldschool">Old School</option> */}
      {/* <option value="neonvibes">Neon Vibes</option> */}
    </select>
  </div>
) : null}

{currentProduct.type === "corporatebranding" ? (
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
      <option value="companylogos">Company Logos</option>
      <option value="events">Events</option>
      <option value="conferences">Conferences</option>
    </select>
  </div>
) : null}

{currentProduct.type === "foodbeverage" ? (
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
      <option value="restaurantmerch">Restaurant Merch</option>
      <option value="coffee">Coffee</option>
      <option value="beerdesigns">Beer Designs</option>
    </select>
  </div>
) : null}

{currentProduct.type === "fitnessmotivation" ? (
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
      <option value="gym">Gym</option>
      <option value="yoga">Yoga</option>
      <option value="bodybuildingprints">Bodybuilding Prints</option>
    </select>
  </div>
) : null}

{currentProduct.type === "entertainmentinfluencer" ? (
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
      <option value="youtubers">YouTubers</option>
      <option value="streamers">Streamers</option>
      <option value="vloggers">Vloggers</option>
    </select>
  </div>
) : null}

{currentProduct.type === "traveladventure" ? (
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
      <option value="maps">Maps</option>
      <option value="compass">Compass</option>
      <option value="wanderlustthemes">Wanderlust Themes</option>
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
accept="image/jpeg,image/jpg,image/png,image/webp"
            hidden
          />
        </div>

<div className="addproduct-itemfield">
          <label htmlFor="file-input1">
            <img
              src={
                rawImage ? URL.createObjectURL(rawImage) : upload_area
              }
              alt=""
              className="addproduct-thumbnail-img"
            />
          </label>
          <input
            onChange={imageHandler1}
            type="file"
            name="raw_image"
            id="file-input1"
accept="image/jpeg,image/jpg,image/png,image/webp"
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
          {productCount < 10 && (
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

          {productCount >= 10 && (
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
