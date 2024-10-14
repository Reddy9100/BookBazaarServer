const mongoose = require('mongoose');
const mongoURI = process.env.mongoURI

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
        });
        console.log("Mongoose connected to DB");

    } catch (error) {
        console.error("Mongoose connection error:", error);
        throw error; // Propagate the error
    }
};

module.exports = connectDB;
