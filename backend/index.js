const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Database connection with MongoDB

mongoose.connect('mongodb+srv://mdb_2025:mdb_23042025@cluster0.bybiulp.mongodb.net/e-commerce')

const allowedOrigins = [
  'https://mdb-com.vercel.app',
  'https://mdb-com-vd5n.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you need to allow credentials like cookies
}));

// API Creation

app.get("/",(req,res)=>{
    res.send("Express App is Running");
})

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req,file,cb) => {
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage: storage
});

// Creating Upload Endpoint for Images
app.use('/images',express.static('upload/images'));

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success : 1,
        image_url : `http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating products

const Product = mongoose.model("Product",{
    id: {type: Number, required: true},
    name: {type: String, required: true},
    image: {type: String, required: true},
    category: {type: String, required: true},
    type: {type: String, required: true},
    subcategory: {type: String, required: true},
    new_price: {type: Number, required: true},
    old_price: {type: Number, required: true},
    date: {type: Date, default: Date.now},
    available : {type: Boolean, default: true},
    created_by_id : {type: String, required: true},
    created_by_name : {type: String, required: true}
})

app.post("/addProduct",async (req,res) =>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id = 1;
    }
    const product = new Product({
        // id: req.body.id,
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        type: req.body.type,
        subcategory: req.body.subcategory,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        date: req.body.date,
        available: req.body.available,
        created_by_id: req.body.created_by_id,
        created_by_name: req.body.created_by_name
    })
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success : true,
        name : req.body.name
    })
})


// Creating API For Deleting Product
app.post("/removeProduct",async (req,res) => {
    await Product.findOneAndDelete({id : req.body.id});
    console.log("Deleted");
    res.json({
        success : true,
        name : req.body.name
    })
})

// Creating API For Getting All Products 
app.get("/fetchProducts",async (req,res) => {
    let products = await Product.find({});
    console.log("All products fetched")
    res.send(products);
})

// Creating API For Getting All Products by user
app.get("/allProducts", async (req, res) => {
    const userId = req.query.user_id;
  
    console.log("Requested user ID:", userId); // 👈 debug log
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      const products = await Product.find({ created_by_id: userId });
      console.log(`Found ${products.length} products for user ID: ${userId}`);
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  });

  // Creating API For Getting All Products by id
app.get("/allProductsById", async (req, res) => {
    const id = req.query.id;
  
    console.log("Requested  ID:", id); // 👈 debug log
  
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
  
    try {
      const products = await Product.find({ id: id });
      console.log(`Found ${products.length} products for  ID: ${id}`);
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Error fetching products", error: error.message });
    }
  });


  //get new collection
  app.get("/newcollections",async (req,res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New collection fetched");
    res.send(newcollection);
  })

// Schema creation for User Model

const Users = mongoose.model("Users",{
    name: {type: String, required: true},
    email : {type: String, required: true,unique: true},
    password : {type: String, required: true},
    role : {type: String, required: true},
    cartData:{
        type: Object
    },
    date : {type: Date, default: Date.now}
})

// Creating API for User Registration

app.post("/signup",async (req,res) => {
    let check = await Users.findOne({email:req.body.email});
    let check2 = await Users.findOne({email:req.body.role});
    if(check){
        return res.status(400).json({
            success : false,
            errors : "User Already Exists"
        })
    }
    let cart = {};
    for (let i=0;i<300;i++){
        cart[i] = 0;
    }
    const user = new Users({
        name: req.body.username,
        email : req.body.email,
        password : req.body.password,
        role : req.body.role,
        cartData : cart
        
    });
    await user.save();

    const data = {
        user : {
            id: user.id
        }
    }
    const token = jwt.sign(data,'secret_mdb');
    res.json({
        success : true,
        token : token,
        role : user.role,
        name : user.name,
        id : user.id
    })
})

//Creating API for User Login

app.post("/login",async (req,res) => {
    let user = await Users.findOne({email : req.body.email});
    //let pass = await Users.findOne({password : req.body.password});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user :{
                    id: user.id,
                    username: user.name,
                    role : user.role
                }
            }
            const token = jwt.sign(data,'secret_mdb');
            res.json({
                success : true,
                token : token,
                role : user.role,
                name : user.name,
                id : user.id
            })
        }
        else{
            res.json({
                success : false,
                errors : "Incorrect Password"
            })
        }
    }
    else{
        res.json({
            success : false,
            errors : "User Not Found"
        })
    }
})


//creating middleware to fetch user
const fetchUser = async (req,res,next) => {
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate using a valid token"});
    }
    try{
        const data = jwt.verify(token,'secret_mdb');
        req.user = data.user;
        next();
    }
    catch(error){
        res.status(401).send({error:"Please authenticate using a valid token"});
    }
}

// creating endpoint for adding products in cart data
app.post("/addToCart",fetchUser,async (req,res) => {
    // console.log(req.body,req.user);
    let userData = await Users.findOne({_id : req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData : userData.cartData});
    res.send("Added To Cart");
})

// creating endpoint for removing products in cart data
app.post("/removeFromCart",fetchUser,async (req,res) => {
    // console.log(req.body);
    let userData = await Users.findOne({_id : req.user.id});
    if(userData.cartData[req.body.itemId] > 0){
    userData.cartData[req.body.itemId] -=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData : userData.cartData});
    res.json("Removed From Cart");
    }
})

// creating endpoint for getting cart data
app.post("/getcart",fetchUser,async (req,res) => {
    console.log("Cart Data");
    let userData = await Users.findOne({_id : req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port "+port);
    }
    else{
        console.log("Error : "+error);
    }
});

// Schema for creating products

const Order = mongoose.model("Orders",{
    user_id: {type: String, required: true},
    name: {type: String, required: true},
    items: {type: Array, required: true},
    amount : {type: Number, required: true},
    date: {type: Date, default: Date.now}
})


// creating endpoint for adding order
app.post("/addOrder", async (req, res) => {
    try {
        const order = new Order({
            user_id: req.body.user_id, // use authenticated user id
            name: req.body.name,
            items: req.body.items,
            amount: req.body.amount
        });

        await order.save();

        // After placing the order, clear the user's cart
        let emptyCart = {};
        for (let i = 0; i < 300; i++) {
            emptyCart[i] = 0;
        }
        await Users.findOneAndUpdate({_id: req.body.user_id}, {cartData: emptyCart});

        res.json({
            success: true,
            order_id: order._id,
            message: "Order Placed Successfully & Cart Emptied"
        });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Order failed", error: error.message });
    }
});
