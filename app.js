require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/routes');
const connectDB = require("./config/dbConfig")

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({
  origin: '*', 
}));

connectDB()
app.use(uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/",async(req,res)=>{
  res.send("Book Bazaar is listening")
})