const LoginModel = require("../model/loginModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Otp = require("otp-generator");
const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");

const generateOtp = () => {
  return Otp.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

const renderTemplate = (templatePath, data) => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, data, (err, html) => {
      if (err) {
        return reject(err);
      }
      resolve(html);
    });
  });
};

exports.Login = async (req, res) => {
  const {name, email } = req.body;
  console.log(req.body)
  if (!name || !email) {
    return res.status(400).json({ message: "All feilds Required" });
  }

  let user = await LoginModel.findOne({ email });

  const OTP = generateOtp();

  if (user) {
    user.otp = OTP;
  } else {
    user = new LoginModel({
      email: email,
      otp: OTP,
    });
  }
  await user.save();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const userTemplatePath = path.join(__dirname, "../views", "LoginMail.ejs");

  try {
    const htmlContent = await renderTemplate(userTemplatePath, { otp: OTP });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      html: htmlContent,
    });

    res.status(200).json({ message: "OTP sent successfully", data: OTP, mail: email });
  } catch (error) {
    console.error("Error sending OTP email", error);
    res.status(500).json({ message: "Error sending OTP email", error });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await LoginModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOtp = generateOtp();

    user.otp = newOtp;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const userTemplatePath = path.join(__dirname, "../views", "LoginMail.ejs");

    const htmlContent = await renderTemplate(userTemplatePath, { otp: newOtp });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your New OTP",
      html: htmlContent,
    });

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error resending OTP", error);
    res.status(500).json({ success: false, message: "Error resending OTP", error });
  }
};

exports.ValidateOtp = async (req, res) => {
  const { enteredOtp, Email } = req.body;

  if (!enteredOtp || !Email) {
    return res.status(400).json({ message: "Both email and OTP are required" });
  }

  const user = await LoginModel.findOne({ email: Email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.otp == enteredOtp) {
    const token = jwt.sign({ Email }, "Celestia", { expiresIn: "1h" });
    res.status(200).json({ success: true, message: "OTP verified successfully", token: token });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }
};
