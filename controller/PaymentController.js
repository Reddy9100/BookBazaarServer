// paymentController.js
const stripe = require("stripe")(process.env.StripeSecret);

// Payment processing function
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethodId, amount } = req.body;
    const finalAmount = amount * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "inr",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
