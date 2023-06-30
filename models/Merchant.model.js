const mongoose = require('mongoose');
const { Schema } = mongoose;

const businessDetailSchema = new Schema({
  merchant_name: { type: String, default: '' },
  business_name: { type: String, default: '' },
  business_type: { type: String, default: '' },
  business_category: { type: String, default: '' },
  business_sub_category: { type: String, default: '' },
  company_expenditure: { type: String, default: '' },
  website: { type: String, default: '' },
  bank_name: { type: String, default: '' },
  bank_account_number: { type: String, default: '' },
  bank_ifsc_code: { type: String, default: '' },
  gst: { type: String, default: '' },
  pan_number: { type: String, default: '' },
  aadhar_number: { type: String, default: '' },
});

const businessAddressSchema = new Schema({
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
});

const kycDocumentsSchema = new Schema({
  company_pan_card: { type: String, default: '' },
  company_gst: { type: String, default: '' },
  bank_statement: { type: String, default: '' },
});

const merchantSchema = new Schema({
  singhtek_id: {
    type: Schema.Types.ObjectId,
    ref: 'SinghtekUser',
  },
  user_name: {
    type: String,
    unique: true,
    default: '',
  },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  password: { type: String, default: '' },
  transaction_limit: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  // locked_amount: { type: Number, default: 0 },
  // liened_amount: { type: Number, default: 0 },
  business_detail: { type: businessDetailSchema, default: {} },
  business_address: { type: businessAddressSchema, default: {} },
  kyc_documents: { type: kycDocumentsSchema, default: {} },
  status: {
    type: String,
    enum: ['Allow', 'Cancel', 'Pending'],
    default: 'Pending',
  },
  user_type: { type: String, default: '' },
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
