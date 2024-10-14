const mongoose = require("mongoose")

const Bookmodel = new mongoose.Schema({
    title: String,
    picture:String,
    author:String,
    rating : String,
    price : String,
    description : String,
    category : String
})

const Book = mongoose.model("Books",Bookmodel)
module.exports = Book