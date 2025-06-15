const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: [
      "https://admin.mydesignbazaar.com",
      "https://mydesignbazaar.com",
      "http://localhost:5174",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Database connection with MongoDB

mongoose.connect(
  "mongodb+srv://mdb_2025:mdb_23042025@cluster0.bybiulp.mongodb.net/e-commerce"
);

// API Creation

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Image Storage Engine

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow these file types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`), false);
    }
  },
});

// Creating Upload Endpoint for Images
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    // image_url: `https://api.mydesignbazaar.com/images/${req.file.filename}`
    image_url: `http://localhost:4000/images/${req.file.filename}`,
  });
});

// Schema for creating products

const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  raw_image: { type: String, default: "" },
  category: { type: String, required: true },
  type: { type: String, required: true },
  subcategory: { type: String, required: true },
  new_price: { type: Number, default: 0 },
  old_price: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
  created_by_id: { type: String, required: true },
  created_by_name: { type: String, required: true },
  is_active: { type: Boolean, default: false },
});

// app.post("/addProduct",async (req,res) =>{
//     let products = await Product.find({});
//     let id;
//     if(products.length > 0){
//         let last_product_array = products.slice(-1);
//         let last_product = last_product_array[0];
//         id = last_product.id + 1;
//     }
//     else{
//         id = 1;
//     }
//     const product = new Product({
//         // id: req.body.id,
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         type: req.body.type,
//         subcategory: req.body.subcategory,
//         // new_price: req.body.new_price,
//         // old_price: req.body.old_price,
//         date: req.body.date,
//         available: req.body.available,
//         created_by_id: req.body.created_by_id,
//         created_by_name: req.body.created_by_name
//     })
//     console.log(product);
//     await product.save();
//     console.log("Saved");
//     res.json({
//         success : true,
//         name : req.body.name
//     })
// })

// Add a new endpoint for batch product insertion
app.post("/addProduct", async (req, res) => {
  try {
    // Check if the request contains products array
    if (
      !req.body.products ||
      !Array.isArray(req.body.products) ||
      req.body.products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No products provided or invalid format",
      });
    }

    // Get the latest product ID
    let products = await Product.find({});
    let nextId;
    if (products.length > 0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      nextId = last_product.id + 1;
    } else {
      nextId = 1;
    }

    // Map through the products and add IDs
    const productsToInsert = req.body.products.map((product, index) => {
      return {
        id: nextId + index,
        name: product.name,
        image: product.image,
        raw_image: product.raw_image || "",
        category: product.category,
        type: product.type,
        subcategory: product.subcategory,
        new_price: product.new_price || 0,
        old_price: product.old_price || 0,
        date: product.date || Date.now(),
        available: product.available !== undefined ? product.available : true,
        created_by_id: product.created_by_id,
        created_by_name: product.created_by_name,
        is_active: product.is_active !== undefined ? product.is_active : false,
      };
    });

    // Insert all products at once
    const result = await Product.insertMany(productsToInsert);

    console.log(`Saved ${result.length} products`);
    res.json({
      success: true,
      count: result.length,
      products: result.map((p) => p.name),
    });
  } catch (error) {
    console.error("Error adding products:", error);
    res.status(500).json({
      success: false,
      message: "Error adding products",
      error: error.message,
    });
  }
});

app.put("/updateProduct", async (req, res) => {
  try {
    const { id, new_price, is_active } = req.body;

    // Validate input
    if (typeof id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find and update the product by `id` (not MongoDB _id)
    const updatedProduct = await Product.findOneAndUpdate(
      { id: id },
      {
        $set: {
          new_price: typeof new_price !== "undefined" ? new_price : 0,
          is_active: typeof is_active !== "undefined" ? is_active : false,
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Creating API For Deleting Product
app.post("/removeProduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Deleted");
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating API For Getting All Products
app.get("/fetchProducts", async (req, res) => {
  let products = await Product.find({ is_active: true }); // only admin approved products where is_active is true
  console.log("All products fetched");
  res.send(products);
});

// // Creating API For Getting All Products
// app.get("/fetchProductsForAdmin",async (req,res) => {
//     let products = await Product.find();
//     console.log("All products fetched")
//     res.send(products);
// })

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
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// Creating API For Getting All Products by user
app.get("/fetchProductsForAdmin", async (req, res) => {
  const userId = req.query.user_id;

  // console.log("Requested user ID:", userId); // 👈 debug log

  // if (!userId) {
  //   return res.status(400).json({ message: "User ID is required" });
  // }

  try {
    const products = await Product.find();
    //   console.log(`Found ${products.length} products for user ID: ${userId}`);
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
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
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// Creating API For Getting Count of Uploaded Product By A Designer
app.post("/getProductCount", async (req, res) => {
  const id = req.body.user_id;

  console.log("Requested ID:", id);

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  try {
    // Query by user_id field instead of id
    const count = await Product.countDocuments({ created_by_id: id });

    return res.status(200).json({
      count: count,
      message: "Product count retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

//get new collection
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({ is_active: true });
  let newcollection = products.slice(1).slice(-8);
  console.log("New collection fetched");
  res.send(newcollection);
});

// Schema creation for User Model

const Users = mongoose.model("Users", {
  name: { type: String, required: true }, //full name
  display_name: { type: String, default: "" }, //display name
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  alt_mobile: { type: String, default: "" },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true },
  govt_id_img: { type: String, default: "" },
  pan_no: { type: String, default: "" },
  gst_no: { type: String, default: "" },
  bank_acc_holder_name: { type: String, default: "" },
  bank_acc_no: { type: String, default: "" },
  bank_name: { type: String, default: "" },
  ifsc_code: { type: String, default: "" },
  upi_id: { type: String, default: "" },
  paypal_id: { type: String, default: "" },
  sample_img1: { type: String, default: "" },
  sample_img2: { type: String, default: "" },
  sample_img3: { type: String, default: "" },
  portfolio_link: { type: String, default: "" },
  specialization: {
    type: Object,
  },
  other_specialization: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, required: true },
  cartData: {
    type: Object,
  },
  date: { type: Date, default: Date.now },
  businessType: { type: String, default: "" },
  other_business_type: { type: String, default: "" },
  paymentMethods: {
    type: Object,
    default: {},
  },
  currency: { type: String, default: "" },
  designCategories: {
    type: Object,
    default: {},
  },
  purchaseFrequency: { type: String, default: "" },
  coins: { type: Number, default: 0 },
  subscription: { type: Number, default: 0 },
});

// Creating API for User Registration

app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  let check2 = await Users.findOne({ email: req.body.role });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "User Already Exists",
    });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    display_name: req.body.display_name,
    email: req.body.email,
    mobile: req.body.mobile,
    alt_mobile: req.body.alt_mobile,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    zipcode: req.body.zipcode,
    country: req.body.country,
    govt_id_img: req.body.govt_id_img,
    pan_no: req.body.pan_no,
    gst_no: req.body.gst_no,
    bank_acc_holder_name: req.body.bank_acc_holder_name,
    bank_acc_no: req.body.bank_acc_no,
    bank_name: req.body.bank_name,
    ifsc_code: req.body.ifsc_code,
    upi_id: req.body.upi_id,
    paypal_id: req.body.paypal_id,
    sample_img1: req.body.sample_img1,
    sample_img2: req.body.sample_img2,
    sample_img3: req.body.sample_img3,
    portfolio_link: req.body.portfolio_link,
    specialization: req.body.specialization,
    other_specialization: req.body.other_specialization,
    password: req.body.password,
    role: req.body.role,
    cartData: cart,
    businessType: req.body.businessType,
    other_business_type: req.body.other_business_type,
    paymentMethods: req.body.paymentMethods,
    currency: req.body.currency,
    designCategories: req.body.designCategories,
    purchaseFrequency: req.body.purchaseFrequency,
    coins: 0,
    subscription: "",
  });
  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };
  const token = jwt.sign(data, "secret_mdb");
  res.json({
    success: true,
    token: token,
    role: user.role,
    name: user.name,
    id: user.id,
  });
});

//Creating API for User Login

app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  //let pass = await Users.findOne({password : req.body.password});
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
          username: user.name,
          role: user.role,
          email: user.email,
        },
      };
      const token = jwt.sign(data, "secret_mdb");
      res.json({
        success: true,
        token: token,
        role: user.role,
        name: user.name,
        id: user.id,
        email: user.email,
      });
    } else {
      res.json({
        success: false,
        errors: "Incorrect Password",
      });
    }
  } else {
    res.json({
      success: false,
      errors: "User Not Found",
    });
  }
});

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_mdb");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

// creating endpoint for adding coins to user data
app.post("/addCoins", async (req, res) => {
  // console.log(req.body,req.user);
  let userData = await Users.findOne({ _id: req.body.id });
  userData.coins = req.body.coins;
  userData.subscription = req.body.coins;
  await Users.findOneAndUpdate({ _id: req.body.id }, { coins: userData.coins });
  await Users.findOneAndUpdate(
    { _id: req.body.id },
    { subscription: userData.coins }
  );
  res.send("Coins Added");
});

// creating endpoint for adding coins to user data
app.post("/removeCoins", async (req, res) => {
  // console.log(req.body,req.user);
  let userData = await Users.findOne({ _id: req.body.id });
  userData.coins = req.body.coins;
  // userData.subscription = req.body.coins;
  await Users.findOneAndUpdate({ _id: req.body.id }, { coins: userData.coins });
  // await Users.findOneAndUpdate({_id:req.body.id},{subscription : userData.coins});
  res.send("Coins Removed");
});

// Creating endpoint for getting coins of user data
app.post("/getCoins", async (req, res) => {
  try {
    // Get user ID from query parameters for GET request
    const userId = req.body.id;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find user by ID
    let userData = await Users.findOne({ _id: userId });

    // Check if user exists
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Send success response with coins
    res.json({
      success: true,
      subscription: userData.subscription,
      coins: userData.coins || 0,
    });
  } catch (error) {
    console.error("Error fetching user coins:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// creating endpoint for adding products in cart data
app.post("/addToCart", fetchUser, async (req, res) => {
  // console.log(req.body,req.user);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added To Cart");
});

// creating endpoint for removing products in cart data
app.post("/removeFromCart", fetchUser, async (req, res) => {
  // console.log(req.body);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );
    res.json("Removed From Cart");
  }
});

// creating endpoint for getting cart data
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("Cart Data");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error : " + error);
  }
});

// Schema for creating products

const Order = mongoose.model("Orders", {
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  transactionId: { type: String, default: "" },
  coins: { type: Number, default: 0 },
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Creating API For Getting All orders
app.get("/fetchOrdersForAdmin", async (req, res) => {
  const userId = req.query.user_id;

  // console.log("Requested user ID:", userId); // 👈 debug log

  // if (!userId) {
  //   return res.status(400).json({ message: "User ID is required" });
  // }

  try {
    const orders = await Order.find();
    //   console.log(`Found ${products.length} products for user ID: ${userId}`);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// creating endpoint for adding order
app.post("/addOrder", async (req, res) => {
  try {
    const order = new Order({
      user_id: req.body.user_id, // use authenticated user id
      name: req.body.name,
      items: req.body.items,
      amount: req.body.amount,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      postalCode: req.body.postalCode,
      transactionId: req.body.transactionId,
      coins: req.body.coins,
      email: req.body.email,
    });

    await order.save();

    // After placing the order, clear the user's cart
    let emptyCart = {};
    for (let i = 0; i < 300; i++) {
      emptyCart[i] = 0;
    }
    await Users.findOneAndUpdate(
      { _id: req.body.user_id },
      { cartData: emptyCart }
    );

    res.json({
      success: true,
      order_id: order._id,
      message: "Order Placed Successfully & Cart Emptied",
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .json({ success: false, message: "Order failed", error: error.message });
  }
});
