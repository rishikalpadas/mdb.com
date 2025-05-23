import React, { createContext, useEffect, useState } from "react";
// import all_product from '../Components/Assets/all_product'
import {base_url} from '../Config/config'
export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index=0;index<300+1;index++){
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = ((props)=>{

    const [all_product,setAll_Product] = useState([]);

    const [cartItems, setCartItems] = useState(getDefaultCart());
    
    useEffect(() => {
        fetch (`${base_url}/fetchProducts`)
        .then(res => res.json())
        .then(data => setAll_Product(data))

        
        if(localStorage.getItem('auth-token')){
            fetch(`${base_url}/getcart`,{
                method:"POST",
                headers:{
                    Accept : "application/form-data",
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    "Content-Type": "application/json",
    
                },
                body: ""
            })
            .then((res) => res.json())
            .then((data) => setCartItems(data));
        }
    },[])
    // console.log(cartItems);
    
    const addToCart = (itemId) => {
        setCartItems((prev) => ({...prev,[itemId]: prev[itemId] + 1}));
            // console.log(cartItems);
            if(localStorage.getItem('auth-token')){
                fetch(`${base_url}/addToCart`,{
                    method:"POST",
                    headers:{
                        Accept : 'application/form-data',
                        'auth-token':`${localStorage.getItem('auth-token')}`,
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({"itemId": itemId}),
                })
                .then((response) => response.json())
                .then((data) => console.log(data));
            }
        }
        
        const removeFromCart = (itemId) => {
            setCartItems((prev) => ({
                ...prev,
                [itemId]: prev[itemId] - 1}));
                // console.log(cartItems);
                if(localStorage.getItem('auth-token')){
                    fetch(`${base_url}/removeFromCart`,{
                        method:"POST",
                        headers:{
                            Accept : "application/form-data",
                            'auth-token':`${localStorage.getItem('auth-token')}`,
                            "Content-Type": "application/json",
    
                        },
                        body: JSON.stringify({
                            "itemId": itemId
                          }),
                    })
                    .then(res => res.json())
                    .then(data => console.log(data));
                }

            }
            
        
        const getTotalCartAmount = () => {
            let totalAmount = 0;
            for (const item in cartItems) {
                if (cartItems[item] > 0) {
                    let itemInfo = all_product.find((product) => product.id === Number(item));
                    totalAmount += cartItems[item] * itemInfo.new_price;
                }
            }
            return totalAmount;
        }

        const getTotalCartItems = () => {
            let totalItem = 0;
            for (const item in cartItems) {
                if(cartItems[item]>0){
                    totalItem += cartItems[item];
                }
            }
            return totalItem;
        }
            
            const contextValue = {all_product,cartItems,addToCart,removeFromCart,getTotalCartAmount,getTotalCartItems};
            return(
                <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
})

export default ShopContextProvider;