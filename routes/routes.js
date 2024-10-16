const express = require('express');
const { UploadSliderBooks ,getBooks } = require("../controller/FormUpload");
const { Login, resendOtp, ValidateOtp } = require('../controller/LoginController');
const Payment = require("../controller/PaymentController")
const router = express.Router();

// Route for uploading files
router.post('/upload',UploadSliderBooks );

// Route for fetching books
router.get('/books', getBooks);

// // Route for serving files
// router.get('/files/:id', getFile);


router.post("/login",Login)

router.post("/resend-otp", resendOtp);

router.post("/validate-otp" ,ValidateOtp)


router.post("/payment",Payment.initiatePayment)

module.exports = router;
