const mongoose = require('mongoose');

const singhtekUserSchema = new mongoose.Schema({
  username: String,
  department: String,
  first_name: String,
  email: String,
  designation: String,
  mobile_no: String,
  user_type: String,
  last_name: String,
  password: String,
  image: String,
  docsFile: String,
//   merchant_ID: mongoose.Schema.Types.ObjectId, // Reference to merchant schema
});

const SinghtekUser = mongoose.model('SinghtekUser', singhtekUserSchema);

module.exports = SinghtekUser;
