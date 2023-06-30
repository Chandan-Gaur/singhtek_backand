const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  status:{
    type:String,
    enum:['allow','cancel','pending'],
    default:'pending'
  }
  
});

const Transaction = mongoose.model('User', transactionSchema);

module.exports = Transaction;
