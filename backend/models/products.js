const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    ProductName:{
        type:String,
        required:true
    },
    ProductHeading:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true,
    },
    BackgroundImage:{
        type:String,
        required:true,
    },
    FrontImage:{
        type:String,
        required:true,
    },
    ProductDescription:{
        type:String,
        required:true
    },
    Material:{
        type:String,
        required:true
    },
    Color:{
        type:String,
        required:true
    },
    Dimension:{
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true
    }
})

const product = new mongoose.model("Products",productSchema)

module.exports = product;