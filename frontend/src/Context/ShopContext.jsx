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

    const [coins, setCoins] = useState(0);

    const [subscription,setSubscription]= useState(0);
    
   useEffect(() => {
    // Fetch products
    fetch(`${base_url}/fetchProducts`)
        .then(res => res.json())
        .then(data => setAll_Product(data))
        .catch(error => console.error('Error fetching products:', error));

    // Fetch coins - POST request with ID in body
    const userId = localStorage.getItem('id'); // or however you store user ID
    if (userId) {
        fetch(`${base_url}/getCoins`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: userId
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setCoins(data.coins);
                setSubscription(data.subscription);
            } else {
                console.error('Error fetching coins:', data.message);
                setCoins(data); // If your API returns coins directly without success wrapper
                
            }
        })
        .catch(error => console.error('Error fetching coins:', error));
    }

    // Fetch cart if user is authenticated
    if (localStorage.getItem('auth-token')) {
        fetch(`${base_url}/getcart`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                'auth-token': `${localStorage.getItem('auth-token')}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({})
        })
        .then((res) => res.json())
        .then((data) => setCartItems(data))
        .catch(error => console.error('Error fetching cart:', error));
    }
}, []);

// Alternative async/await version
useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch products
            const productsRes = await fetch(`${base_url}/fetchProducts`);
            const productsData = await productsRes.json();
            setAll_Product(productsData);

            // Fetch coins with GET request
            const userId = localStorage.getItem('id');
            if (userId) {
                const coinsRes = await fetch(`${base_url}/getCoins`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        id: userId
                    })
                });
                const coinsData = await coinsRes.json();

                if (coinsData.success) {
                    setCoins(coinsData);
                } else {
                    setCoins({ coins: 0 }); // Fallback if response is not successful
                }
            }

            // Fetch cart if authenticated
            if (localStorage.getItem('auth-token')) {
                const cartRes = await fetch(`${base_url}/getcart`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        'auth-token': `${localStorage.getItem('auth-token')}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({})
                });
                const cartData = await cartRes.json();
                setCartItems(cartData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
}, []);

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
            
            const contextValue = {all_product,coins,subscription,cartItems,addToCart,removeFromCart,getTotalCartAmount,getTotalCartItems};
            return(
                <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
})

export default ShopContextProvider;