const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema({
    items: [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        picture: { type: String } 
    }],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    user: { 
       
        email: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now }
});


const Order = mongoose.model("Order", OrderSchema);


module.exports = Order;
