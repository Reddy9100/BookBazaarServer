const mongoose = require("mongoose")


const Login = new mongoose.Schema({
    email : {
        type : String,
        required:true
    },
    otp:{
        type:Number
    },
   
})

const LoginModel = mongoose.model("User",Login)
module.exports = LoginModel