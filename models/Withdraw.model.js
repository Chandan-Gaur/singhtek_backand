const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  withdrawal_id: String,
  user_id:String,
  user_name:String,
  customer_code:{
    type:String,
    enum:['299054'],
    default:'299054'
  },
  customer_name:{
    type:String,
    enum:['Singhtek Infolution OPC Pvt Ltd'],
    default:'Singhtek Infolution OPC Pvt Ltd'
  },
  debit_account_number: {
    type:String,
    enum:['41752120260'],
    default:'41752120260'
  },
  product_code: {
    type:String,
    enum:['RTGS','NEFT','DSR',''],
    default:''
  },
  dealer_code: String,
  beneficiary_name: String,
  credit_account_number: String,
  beneficiary_branch_code:{
    type:String,
  },
  amount: Number,
  remarks_1: {
    type:String,
    default:''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  bank_status: {
    type: String,
    enum: ['Success', 'Pending', 'Reject','Approved','Inprocess','Hold'],
    default: 'Pending'
  },
  utr_number: {
    type:String,
    default:""
  },
  transaction_id:{
    type:String,
    default:''
  },
  merchantID: String,
  subAdminID:String,
  merchant_status: {
    type: String,
    enum: ['Allow', 'Pending', 'Cancel'],
    default: 'Pending'
  },
  admin_status: {
    type: String,
    enum: ['Allow', 'Pending', 'Cancel'],
    default: 'Pending'
  }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
