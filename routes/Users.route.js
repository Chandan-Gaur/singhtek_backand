const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/Users.model');
const Merchant = require('../models/Merchant.model');
const { auth } = require('../middleware/auth');
const Withdrawal = require('../models/Withdraw.model');
const UserWithdrawalStatus = require('../models/UserWithdrawalStatus.model');
const UserRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */


UserRoute.get("/", (req, res) => {
  return res.status(200).json("User route")
})

UserRoute.post('/login', async (req, res) => {

  const user = await User.findOne({ email: req.body.email });
  // console.log(req.body)
  if (user) {
    // compare hashed password with plain password
    try {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
          //on success generate token for user
          const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
          return res.status(200).json(token)
        }
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "error while user login" })
    }
  } else {
    return res.status(500).json('No user found')
  }

})

// UserRoute.use(auth);

UserRoute.patch("/edit", async (req, res) => {

  const user = await User.findById({ _id: req.body.userId });
  try {
    if (user) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      console.log(req.body)
      await User.findByIdAndUpdate({ _id: req.body.userId }, req.body);
      return res.status(200).json({ message: 'user updated succesfully' })
    }
    else {
      return res.status(401).json('user not found')
    }
  } catch (error) {
    console.log(error)
    return res.status(401).json("Error in user update")
  }
})




UserRoute.post('/withdrawal', async (req, res) => {


  console.log(req.body)
  const startWithdrawalId = 5748934;
  const lastWithdrawal = await Withdrawal.findOne().sort({ withdrawal_id: -1 });
  const lastWithdrawalId = lastWithdrawal ? parseInt(lastWithdrawal.withdrawal_id.substring(3)) : startWithdrawalId - 1;
  let nextWithdrawalId = lastWithdrawalId + 1;

  let withdrawalDataArray = Array.isArray(req.body) ? req.body : [req.body];

  try {
    for (const withdrawalData of withdrawalDataArray) {
      const id = withdrawalData.dealer_code;
      const merchantUser = await Merchant.findOne({ _id: id });

      const withdrawalId = `WD-${nextWithdrawalId.toString().padStart(8, '0')}`;
      let product_code = '';

      if (withdrawalData.beneficiary_branch_code && withdrawalData.beneficiary_branch_code.length >= 4) {
        if (withdrawalData.beneficiary_branch_code.substring(0, 4).toUpperCase() === 'SBIN') {
          product_code = 'DSR';
        }
      }

      if (product_code === '') {
        if (withdrawalData.amount > 200000) {
          product_code = 'RTGS';
        } else {
          product_code = 'NEFT';
        }
      }
      console.log(withdrawalData.credit_account_number)
      const withdrawal = new Withdrawal({
        withdrawal_id: withdrawalId,
        merchant_status: 'Pending',
        bank_status: 'Pending',
        product_code,
        credit_account_number:withdrawalData.credit_account_number,
        beneficiary_branch_code: withdrawalData.beneficiary_branch_code,
        amount: withdrawalData.amount,
        remarks_1: withdrawalId,
        dealer_code: withdrawalData.dealer_code,
        merchantID: withdrawalData.dealer_code,
        subAdminID: merchantUser.singhtek_id,
        ...withdrawalData
      });

      // console.log(req.body)

      const withdrawalStatus = new UserWithdrawalStatus({
        withdrawal_id: withdrawalId,
        userID: withdrawalData.user_id,
        amount: withdrawalData.amount,
        beneficiary_branch_code: withdrawalData.beneficiary_branch_code,
        expected_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        request_date: new Date(Date.now()),
        status_date: new Date(Date.now())
      });

      await withdrawalStatus.save();
      await withdrawal.save();
      nextWithdrawalId++;
    }

    res.status(201).json({ message: 'Your requests have been placed' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while creating the withdrawals.' });
  }
});

UserRoute.get('/withdrawal/status/:id', async (req, res) => {
  // console.log(req.body.userId)
  const userId = req.params.id;
  
  try {
    const withdrawalStatus = await UserWithdrawalStatus.find({ userID: userId });
    if (withdrawalStatus) {
      return res.status(200).json(withdrawalStatus);
    } else {
      return res.status(404).json({ message: 'User withdrawal status not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error while retrieving user withdrawal status' });
  }
});

UserRoute.patch("/withdrawal",async(req,res)=>{
    const {withdrawal_id}  = req.body;
    try {

      const withdrawal = await Withdrawal.findOne({withdrawal_id:withdrawal_id});
      if(!withdrawal){
        return res.status(500).json({error:"Withdrawal Not find"});
      }
      withdrawal.user_id  = req.body.user_id
      withdrawal.user_name  = req.body.user_name
      withdrawal.dealer_code  = req.body.dealer_code
      withdrawal.credit_account_number  = req.body.credit_account_number
      withdrawal.beneficiary_name  = req.body.beneficiary_name
      withdrawal.beneficiary_branch_code  = req.body.beneficiary_branch_code
      withdrawal.amount  = req.body.amount

      await withdrawal.save();
      return res.status(200).json({message:'Data Updated Success'})
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({error:error});
    }
})





module.exports = UserRoute