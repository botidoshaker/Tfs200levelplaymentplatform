const crypto = require('crypto');

// Generate unique reference for transactions
const generateReference = () => {
  return 'TXN_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex').toUpperCase();
};

// Validate Paystack signature
const validatePaystackSignature = (req) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY);
  hash.update(JSON.stringify(req.body));
  const digest = hash.digest('hex');
  
  return req.headers['x-paystack-signature'] === digest;
};

module.exports = {
  generateReference,
  validatePaystackSignature
};
