import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'
import {base_url} from '../../Config/config'

const AddProduct = () => {
    const config = base_url;

    const [image,setImage] = useState(false);
    const [productDetails,setProductDetails] = useState({
        name: '',
        image: '',
        category: '',
        type: '',
        subcategory: '',
        new_price: '',
        old_price: '',
        created_by_id: localStorage.getItem('id'),
        created_by_name: localStorage.getItem('username'),
    });


    // Add validation state
    const [validationErrors, setValidationErrors] = useState({
      category: false,
      type: false,
      subcategory: false
  });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }

    const changeHandler = (e) => {
      setProductDetails({...productDetails,[e.target.name]:e.target.value});
      
      // Clear validation error when field gets a value
      if (e.target.name === 'category' || e.target.name === 'type' || e.target.name === 'subcategory') {
          if (e.target.value !== '') {
              setValidationErrors({...validationErrors, [e.target.name]: false});
          }
      }
  }

    const validateForm = () => {
      let isValid = true;
      const newValidationErrors = { ...validationErrors };
      
      if (productDetails.category === '') {
          newValidationErrors.category = true;
          isValid = false;
      }
      
      if (productDetails.type === '') {
          newValidationErrors.type = true;
          isValid = false;
      }
      
      if (productDetails.type !== '' && productDetails.type !== 'others' && productDetails.subcategory === '') {
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
  }

    const Add_Product = async () => {

      // Validate before proceeding
    if (!validateForm()) {
      return;
  }

        console.log(productDetails);
        let responseData;
        let product = productDetails;

        let formData = new FormData();
        formData.append('product',image);

        await fetch(`${config}/upload`,{
            method: 'POST',
            headers: {
                Accept : 'application/json',
            },
            body: formData,

        }).then ((resp) => resp.json()).then((data) => {responseData=data})

        if(responseData.success){
            product.image = responseData.image_url;
            console.log(product); 
            await fetch(`${config}/addproduct`,{
                method: 'POST',
                headers: {
                    Accept : 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),

            }).then ((resp) => resp.json()).then((data) => {
                data.success ? alert("Product Added Successfully") : alert("Product Adding Failed")
                productDetails.name = '';
                productDetails.image = '';
                productDetails.category = '';
                productDetails.type = '';
                productDetails.subcategory = '';
                productDetails.new_price = '';
                productDetails.old_price = '';
                productDetails.created_by_id = localStorage.getItem('id');
                productDetails.created_by_name = localStorage.getItem('username');
                setImage(false);
                
            })
        }
    }



  return (
    <div className='add-product'>
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder='Type here' />
      </div>
      <div className="addproduct-price">
      <div className="addproduct-itemfield">
        <p>Price</p>
        <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Type here' />
      </div>
      <div className="addproduct-itemfield">
        <p>Offer Price</p>
        <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder='Type here' />
      </div>
      </div>
      <div className="addproduct-itemfield">
        <p>Product Category</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className='addproduct-selector'>
            <option value="" disabled>Select Category</option>
            <option value="apparel">Apparel</option>
            <option value="printpattern">Print & Pattern</option>
            <option value="themebased">Theme-Based</option>
            <option value="customizationbased">Customization-Based</option>
            <option value="businessindustryspecific">Business & Industry-Specific</option>
            <option value="others">Others</option>
        </select>
      </div>

      {/*******************************  Conditional Rendering For Product Type ***************************************************/}
      {productDetails.category === 'apparel' ?
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select value={productDetails.type} onChange={changeHandler} name="type" className='addproduct-selector'>
            <option value="" disabled>Select Type</option>
            <option value="tshirts">T-Shirts</option>
            <option value="hoodiessweatshirts">Hoodies & Sweatshirts</option>
            <option value="jacketsblazers">Jackets & Blazers</option>
            <option value="ethnicwear">Ethnic Wear</option>
            <option value="kidswear">Kidswear</option>
            <option value="sportswearactivewear">Sportswear & Activewear</option>
            <option value="casualwear">Casual Wear</option>
            <option value="corporatewear">Corporate Wear</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.category === 'printpattern' ?
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select value={productDetails.type} onChange={changeHandler} name="type" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="graphicprints">Graphic Prints</option>
            <option value="typographyquotes">Typography & Quotes</option>
            <option value="floralnature">Floral & Nature</option>
            <option value="animalwildlife">Animal & Wildlife</option>
            <option value="abstractgeometric">Abstract & Geometric</option>
            <option value="culturaltraditional">Cultural & Traditional</option>
            <option value="plaidcheckered">Plaid & Checkered</option>
            <option value="psychedelictrippy">Psychedelic & Trippy</option>
            <option value="others">Others</option>
        </select>
      </div>:null}


      {productDetails.category === 'themebased' ?
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select value={productDetails.type} onChange={changeHandler} name="type" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="summerbeachwear">Summer & Beachwear</option>
            <option value="winterchristmas">Winter & Christmas</option>
            <option value="halloweenhorror">Halloween & Horror</option>
            <option value="valentineromantic">Valentine's & Romantic</option>
            <option value="festivecelebration">Festive & Celebration</option>
            <option value="gamingesports">Gaming & Esports</option>
            <option value="musicpopculture">Music & Pop Culture</option>
            <option value="vintageretro">Vintage & Retro</option>
            <option value="others">Others</option>
        </select>
      </div>:null}


      {productDetails.category === 'customizationbased' ?
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select value={productDetails.type} onChange={changeHandler} name="type" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="editablecolorvariations">Editable Color Variations</option>
            <option value="aigeneratedexclusiveprints">AI Generated Exclusive Prints</option>
            <option value="scalablevectordesigns">Scalable Vector Designs</option>
            <option value="mockupsreadytoprintfiles">Mockups & Ready-to-Print Files</option>
            <option value="others">Others</option>
        </select>
      </div>:null}


      {productDetails.category === 'businessindustryspecific' ?
      <div className="addproduct-itemfield">
        <p>Product Type</p>
        <select value={productDetails.type} onChange={changeHandler} name="type" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="corporatebranding">Corporate Branding</option>
            <option value="foodbeverage">Food & Beverage</option>
            <option value="fitnessmotivation">Fitness & Motivation</option>
            <option value="entertainmentinfluencermerch">Entertainment & Influencer Merch</option>
            <option value="traveladventure">Travel & Adventure</option>
            <option value="others">Others</option>
        </select>
      </div>:null}


      {/* ********************************************************************************************************************************* */}


      {/************************** *********************** Conditional Rendering for Subcategory *********************************************/}
      {productDetails.type === 'tshirts' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="casual">Casual</option>
            <option value="oversized">Oversized</option>
            <option value="graphic">Graphic</option>
            <option value="typography">Typography</option>
            <option value="retro">Retro</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'hoodiessweatshirts' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="urban">Urban</option>
            <option value="minimal">Minimal</option>
            <option value="embroidered">Embroidered</option>
            <option value="anime">Anime</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'jacketsblazers' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="streetwear">Streetwear</option>
            <option value="denim">Denim</option>
            <option value="bomber">Bomber</option>
            <option value="formal">Formal</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'ethnicwear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="sareeprints">Saree Prints</option>
            <option value="kurtapatterns">Kurta Patterns</option>
            <option value="dupattadesigns">Dupatta Designs</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'kidswear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="cartoon">Cartoon</option>
            <option value="cutepatterns">Cute Patterns</option>
            <option value="nurseryprints">Nursery Prints</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Sportswear & Activewear */}
      {productDetails.type === 'sportswearactivewear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="fitness">Fitness</option>
            <option value="athleisure">Athleisure</option>
            <option value="jerseydesigns">Jersey Designs</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Casual Wear */}
      {productDetails.type === 'casualwear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="polo">Polo</option>
            <option value="halfsleeve">Half-sleeve</option>
            <option value="fullsleeve">Full-sleeve</option>
            <option value="vintage">Vintage</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Corporate Wear */}
      {productDetails.type === 'corporatewear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="uniforms">Uniforms</option>
            <option value="poloshirts">Polo Shirts</option>
            <option value="eventtees">Event Tees</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Graphic Prints */}
      {productDetails.type === 'graphicprints' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="artistic">Artistic</option>
            <option value="digital">Digital</option>
            <option value="conceptual">Conceptual</option>
            <option value="illustrations">Illustrations</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Typography & Quotes */}
      {productDetails.type === 'typographyquotes' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="motivational">Motivational</option>
            <option value="funny">Funny</option>
            <option value="minimal">Minimal</option>
            <option value="calligraphy">Calligraphy</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Floral & Nature */}
      {productDetails.type === 'floralnature' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="botanical">Botanical</option>
            <option value="watercolor">Watercolor</option>
            <option value="abstractleaves">Abstract Leaves</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Animal & Wildlife */}
      {productDetails.type === 'animalwildlife' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="leopard">Leopard</option>
            <option value="tiger">Tiger</option>
            <option value="birds">Birds</option>
            <option value="jungle">Jungle</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Abstract & Geometric */}
      {productDetails.type === 'abstractgeometric' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="futuristic">Futuristic</option>
            <option value="lineart">Line Art</option>
            <option value="opticalillusions">Optical Illusions</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Cultural & Traditional */}
      {productDetails.type === 'culturaltraditional' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="indian">Indian</option>
            <option value="japanese">Japanese</option>
            <option value="tribal">Tribal</option>
            <option value="boho">Boho</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Plaid & Checkered */}
      {productDetails.type === 'plaidcheckered' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="classic">Classic</option>
            <option value="scottish">Scottish</option>
            <option value="modernvariations">Modern Variations</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Psychedelic & Trippy */}
      {productDetails.type === 'psychedelictrippy' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="vibrant">Vibrant</option>
            <option value="opticalwaves">Optical Waves</option>
            <option value="gradientmagic">Gradient Magic</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Summer & Beachwear */}
      {productDetails.type === 'summerbeachwear' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="tropical">Tropical</option>
            <option value="hawaiian">Hawaiian</option>
            <option value="sunsetprints">Sunset Prints</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Winter & Christmas */}
      {productDetails.type === 'winterchristmas' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="snowflakes">Snowflakes</option>
            <option value="reindeer">Reindeer</option>
            <option value="cozythemes">Cozy Themes</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Halloween & Horror */}
      {productDetails.type === 'halloweenhorror' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="skulls">Skulls</option>
            <option value="witches">Witches</option>
            <option value="darkaesthetic">Dark Aesthetic</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Valentine's & Romantic */}
      {productDetails.type === 'valentineromantic' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="hearts">Hearts</option>
            <option value="lovequotes">Love Quotes</option>
            <option value="cutedoodles">Cute Doodles</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Festive & Celebration */}
      {productDetails.type === 'festivecelebration' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="diwali">Diwali</option>
            <option value="eid">Eid</option>
            <option value="newyear">New Year</option>
            <option value="holiprints">Holi Prints</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Gaming & Esports */}
      {productDetails.type === 'gamingesports' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="pixelart">Pixel Art</option>
            <option value="consoleinspired">Console-Inspired</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Music & Pop Culture */}
      {productDetails.type === 'musicpopculture' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="bandtees">Band Tees</option>
            <option value="dj">DJ</option>
            <option value="retrocassette">Retro Cassette</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Vintage & Retro */}
      {productDetails.type === 'vintageretro' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="80s90s">80s & 90s</option>
            <option value="oldschool">Old School</option>
            <option value="neonvibes">Neon Vibes</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Customization-Based categories */}
      {productDetails.type === 'editablecolorvariations' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="premium">Premium</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'aigeneratedexclusiveprints' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="abstract">Abstract</option>
            <option value="realistic">Realistic</option>
            <option value="stylized">Stylized</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'scalablevectordesigns' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="simple">Simple</option>
            <option value="complex">Complex</option>
            <option value="customizable">Customizable</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'mockupsreadytoprintfiles' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="apparel">Apparel</option>
            <option value="accessories">Accessories</option>
            <option value="packaging">Packaging</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {/* Adding subcategories for Business & Industry-Specific categories */}
      {productDetails.type === 'corporatebranding' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="logos">Company Logos</option>
            <option value="events">Events</option>
            <option value="conferences">Conferences</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'foodbeverage' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="restaurant">Restaurant Merch</option>
            <option value="coffee">Coffee</option>
            <option value="beerdesigns">Beer Designs</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'fitnessmotivation' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="gym">Gym</option>
            <option value="yoga">Yoga</option>
            <option value="bodybuilding">Bodybuilding Prints</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'entertainmentinfluencermerch' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="youtubers">YouTubers</option>
            <option value="streamers">Streamers</option>
            <option value="vloggers">Vloggers</option>
            <option value="others">Others</option>
        </select>
      </div>:null}

      {productDetails.type === 'traveladventure' ?
      <div className="addproduct-itemfield">
        <p>Product Subcategory</p>
        <select value={productDetails.subcategory} onChange={changeHandler} name="subcategory" className='addproduct-selector'>
        <option value="" disabled>Select Type</option>
            <option value="maps">Maps</option>
            <option value="compass">Compass</option>
            <option value="wanderlust">Wanderlust Themes</option>
            <option value="others">Others</option>
        </select>
      </div>:null}
      {/* *************************************************************************************************************************************** */}

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
            <img src={image?URL.createObjectURL(image): upload_area} alt="" className='addproduct-thumbnail-img' />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>
      <button onClick={() => Add_Product()} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default AddProduct