const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {
  app.post('/api/stripe', requireLogin, async (req, res) => { // route handlers accept arbitrary number of functions(middleware)
    const charge = await stripe.charges.create({
      amount: 500,
      currency: 'usd',
      description: 'test charge',
      source: req.body.id
    });

    req.user.credits += 5;
    const user = await req.user.save(); // updated user model

    res.send(user);
  });
};
