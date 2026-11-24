const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const userRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

// Port Number
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
   throw new Error("MONGODB_URI is required. Set it in your .env file.");
}

// Server
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// MongoDB connection:
mongoose.connect(mongoUri);

// Monitor the status of the db connection:
const db = mongoose.connection;
db.on("error", () => console.error("Connection to the db failed"));
db.once("open", () => console.log("Now connected to the MongoDB Atlas."));

// Api urls
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);

if(require.main === module){
   app.listen(port, () => {
       console.log(`API is now online on port ${port}`)
   });
}