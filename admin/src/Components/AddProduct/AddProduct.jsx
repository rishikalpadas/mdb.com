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
        category: 'people',
        new_price: '',
        old_price: '',
        created_by_id: localStorage.getItem('id'),
        created_by_name: localStorage.getItem('username'),
    });

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }

    const changeHandler = (e) => {
        setProductDetails({...productDetails,[e.target.name]:e.target.value});
    }

    const Add_Product = async () => {
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
                productDetails.category = 'people';
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
            <option value="people">People</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="business">Business</option>
            <option value="traveltourism">Travel & Tourism</option>
            <option value="festivalscelebrations">Festivals & Celebrations</option>
            <option value="foodcuisine">Food & Cuisine</option>
            <option value="naturelandscapes">Nature & Landscapes</option>
            <option value="education">Education</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
        </select>
      </div>
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
