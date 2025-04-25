import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import {base_url} from '../../Config/config'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {
  const config = base_url;

  const [allproducts,setAllProducts] = useState([]);

  const fetchInfo = async () => {
    const userId = localStorage.getItem('id');
    await fetch(`${config}/allProducts?user_id=${userId}`)
      .then((resp) => resp.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };
  

  const remove_product = async (id) => {
    await fetch(`${config}/removeproduct`,{
      method: 'POST',
      headers:{
        Accept: 'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify({id:id})
    }).then((resp) => resp.json()).then((data) => {
      if(data.success){
        fetchInfo();
      } 
      else{
        alert("Product Removing Failed");
      }
    })
  }

  useEffect(() => {
    fetchInfo();
  },[])

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        {/* <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p> */}
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product,index)=>{
          return (
            <>
            <div key={index} className="listproduct-format-main listproduct-format">
              <img src={product.image} alt="" className='listproduct-product-icon' />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img className='listproduct-remove-icon' src={cross_icon} alt="" onClick={()=>{remove_product(product.id)}} />
            </div>
            <hr />
            </>
          )
        })}
      </div>
    </div>
  )
}

export default ListProduct
