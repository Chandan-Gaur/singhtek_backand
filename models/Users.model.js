const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  merchant_id: mongoose.Schema.Types.ObjectId,
  email:String,
  customer_id: {
    type: String,
    unique: true
  },
  email:String,
  customer_name: String,
  phone:String,
  credit_account_no: String,
  accout_name: String,
  aadhar_number: String,
  pan_number: String,
  password:String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
