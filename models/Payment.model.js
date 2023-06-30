const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_name: String,
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  timestamp: { type: Date, default: Date.now },
  merchantID : {type: String, required: true}
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
