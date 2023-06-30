const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bank_id: mongoose.Schema.Types.ObjectId,
  act_name: String,
  act_no: String,
  ifsc_code: String,
  act_type: String,
  bank_name: String,
});

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;
