const stripe = require('stripe')(process.env.StripeSecret);
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const Order = require('../model/orderModel');

// Render email template
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

// Initiate Payment
exports.initiatePayment = async (req, res) => {
  const { items, Useraddress, email, totalAmount } = req.body;

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
      cancel_url: 'https://bookbazaaaar.netlify.app/',
      metadata: {
        Useraddress,
        email,
        totalAmount,
      },
    });

    const order = new Order({
      items,
      totalAmount,
      address: Useraddress,
      status: 'pending',
      user: { email },
    });

    await order.save();
    res.status(200).json({ success: true, id: session.id, url: session.url });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Webhook to handle Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve the order using metadata
    const order = await Order.findOne({ "user.email": session.metadata.email, status: 'pending' });

    if (order) {
      // Update the order status to paid
      order.status = 'paid';
      await order.save();

      // Send confirmation email
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
      const htmlContent = await renderTemplate(userTemplatePath, { items: order.items, Useraddress: order.address, totalAmount: order.totalAmount });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: session.metadata.email,
        subject: "Your Order Confirmation",
        html: htmlContent,
      });
    }
  }

  res.status(200).send('Received');
};

// Get Orders
exports.getOrders = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const orders = await Order.find({ "user.email": email });

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
