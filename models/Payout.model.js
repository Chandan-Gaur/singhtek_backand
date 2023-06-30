const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId, // Reference to singhtek_users schema
  merchant_id: mongoose.Schema.Types.ObjectId, // Reference to merchant schema
  txn_id: String,
  txn_mode: String,
  bank_id: mongoose.Schema.Types.ObjectId, // Reference to bank schema
  amount: Number,
  remarks: String,
});

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
