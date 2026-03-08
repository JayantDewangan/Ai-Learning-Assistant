/*
- Mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js or ExpressJs.
- It helps us define structure of the data, validate data and interact with MongoDB easily.
- In simple words Mongoose is a bridge between our express 
MongoDB stores data in BSON (JSON-like documents).

-Without Mongoose:
    - No structure
    - No validation
    - No relationships
    - No middleware

- Mongoose gives:
    - Schema
    - Model
    - Validation
    - Middleware
    - Easy queries
*/

import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI,{
            tls: true,
            tlsInsecure: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected : ${conn.connection.host}`);
    }catch(error){
        console.error(`Error connecting to MongoDB : ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;