const stripe = require('stripe')(process.env.StripeSecret);
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const Order = require('../model/orderModel');

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

exports.initiatePayment = async (req, res) => {
  const { items, Useraddress, email,totalAmount } = req.body;
  
  

  console.log(req.body); 

  const line_items = items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.title,
        images: [item.picture],
      },
      unit_amount: parseInt(item.price) * 100,
    },
    quantity: item.quantity,
  }));

  try {
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://reddy9100.github.io/successsound/',
      cancel_url: 'https://bookbazaar-10gv.onrender.com/',
      metadata: {
        Useraddress,
      },
    });



    const order = new Order({
      items: items,
      totalAmount: totalAmount,
      address: Useraddress,
      user: {
        email: email
      }
    });

    await order.save()
    
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

    const userTemplatePath = path.join(__dirname, "../views", "orders.ejs"); 

    
    const htmlContent = await renderTemplate(userTemplatePath, { items, Useraddress,totalAmount });

   
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Order Confirmation",
      html: htmlContent,
    });

    // Respond with session details
    res.status(200).json({ success: true, id: session.id, url: session.url });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getOrders = async (req, res) => {
  const { email } = req.body;
console.log(req.body)
  
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const orders = await Order.find({"user.email" : email });
    console.log(orders)

    if (orders.length > 0) {
      return res.status(200).json({ success: true, orders });
    } else {
      return res.status(404).json({ success: false, message: "No orders found." });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
