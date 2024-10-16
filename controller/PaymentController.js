const stripe = require('stripe')(process.env.StripeSecret);

exports.initiatePayment = async (req, res) => {
  const { items, address } = req.body;

  console.log(items); 

  
  const line_items = items.map(item => ({
    price_data: {
      currency: 'inr', 
      product_data: {
        name: item.title, 
        images: [item.picture], 
      },
      unit_amount: parseInt(item.price)*100
    },
    quantity: item.quantity, 
  }));

  try {
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items, 
      mode: 'payment', 
      success_url: 'https://bookbazaar-10gv.onrender.com/successPayment', 
      cancel_url: 'https://bookbazaar-10gv.onrender.com/', 
      metadata: {
        address, 
      },
    });
    res.status(200).json({ success: true, id: session.id ,url:session.url});
  } catch (error) {
    console.error('Payment initiation error:', error); 
    res.status(500).json({ success: false, error: error.message }); 
  }
};
