const express = require('express');
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const MerchantRoute = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users.model');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const path = require('path');
const Withdrawal = require('../models/Withdraw.model');

MerchantRoute.use(express.json());
require('dotenv').config();

MerchantRoute.get('/', (req, res) => {
  return res.status(200).json('Merchant Route');
});
 

// MerchantRoute.post('/login', async (req, res) => {
    
//   const { email, password } = req.body;
//   try {
//     const user = await Merchant.findOne({ email: email, status:'Allow' });
//     console.log(user);
//     if (user) {
//       // compare hashed password with plain password
//       bcrypt.compare(password, user.password, (err, result) => {
//         if (result) {
//           // on success generate token for user
//           const token = jwt.sign({ userId: user._id }, process.env.TOKEN_KEY);
//           return res.status(200).json({ token: `${token}` ,UserType:`${user.user_type}`, Username:`${user.user_name}` });
//         } else {
//           return res.status(401).json({ message: 'wrong email or password' });
//         }
//       });
//     } else {
//       return res.status(401).json('User Not found');
//     }
//   } catch (error) {
//     return res.status(401).json({ error: 'error while login merchant' });
//   }
// });

MerchantRoute.use(auth);

MerchantRoute.get("/detail", async (req, res) => {
  const merchantId = req.body.userId;

  // Find the merchant in the database based on the provided userId
  const merchant = await Merchant.findOne({ _id: merchantId });

  // Find the total amount in the Withdrawal schema where merchant_status is not "cancel"
  const totalAmount = await Withdrawal.aggregate([
    {
      $match: {
        merchantID: req.body.userId,
        merchant_status: { $nin: ["Cancel", "Allow"] }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);

  // console.log(totalAmount)

  // Calculate the balances based on the total withdrawal amount
  let merchantAmount = merchant.amount;
  let lockedAmount = totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;
  let lineBalance = merchantAmount-lockedAmount >= 0 ? 0 : lockedAmount - merchantAmount;

   const response = {
    merchant: merchant,
    balances: {
      merchant_amount: merchantAmount,
      locked_amount: lockedAmount,
      line_balance: lineBalance
    }
  };
  // Return the response as a JSON response with a 200 status code
  return res.status(200).json(response);
});


MerchantRoute.post("/user/register", async (req, res) => {
    console.log(req.body)
    try {
      const { email, password } = req.body;
  
      // Check if the sr_number is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'email is already taken' });
      }
  
      const startCustomerId = 637801;
  
      const lastUser = await User.findOne().sort({ customer_id: -1 });
      
      // Generate the next customer_id by incrementing the last assigned id
      const lastCustomerId = lastUser ? parseInt(lastUser.customer_id) : startCustomerId - 1;
      const nextCustomerId = lastCustomerId + 1;
      const customer_id = nextCustomerId.toString().padStart(6, '0'); // Pad with leading zeros if needed
     
      // Get merchant_id 
      const merchant_id = req.body.userId;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        merchant_id: merchant_id,
        email: req.body.email,
        customer_id: customer_id,
        customer_name: req.body.customer_name,
        phone: req.body.phone,
        credit_account_no: req.body.credit_account_no,
        account_name: req.body.account_name,
        aadhar_number: req.body.aadhar_number,
        pan_number: req.body.pan_number,
        password: hashedPassword
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  })

MerchantRoute.get("/getWithdrawals", async (req, res) => {
    // console.log(req.query)
    const {userId} = req.body;
  


    try {
      const data = await Withdrawal.find({ merchantID: userId, bank_status: { $nin: ["Success", "Reject"] } })
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred while retrieving the data." });
    }
  });
  
  

MerchantRoute.get("/getWithdrawals/sucess",async(req,res)=>{
   const id = req.body.userId;
   const data = await Withdrawal.find({merchantID:id,bank_status:"Success"});
   return res.status(200).json(data)
})

MerchantRoute.get("/getWithdrawals/pending", async (req, res) => {
  const userId = req.body.userId;
  try {
    const data = await Withdrawal.find({
      merchantID: userId,
      merchant_status:'Allow',
      bank_status: { $nin: ["Success", "Reject"] }
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while retrieving the data." });
  }
});


MerchantRoute.get("/getWithdrawals/failed",async(req,res)=>{
   const id = req.body.userId;
   const data = await Withdrawal.find({merchantID:id,bank_status:"Reject"});
   return res.status(200).json(data)
})

MerchantRoute.get("/withdrawals/allow",async(req,res)=>{
    // console.log("hi")
  try {

    const withdrawals = await Withdrawal.find({ merchant_status: 'Allow', merchantID: req.body.userId });
    return res.status(200).json(withdrawals)
  } catch (error) {
    // Handle errors
    console.error('An error occurred while fetching Withdrawal data:', error);
  }
  
})

MerchantRoute.post('/withdrawal/updatestatus', async (req, res) => {
  // Retrieve the withdrawal ID and merchant status from the request body
  const { withdrawal_id, merchant_status } = req.body;
  console.log(req.body)
  try {
    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findOne({ withdrawal_id });

    if (!withdrawal) {
      // Withdrawal not found
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    // Update the merchant status
    withdrawal.merchant_status = merchant_status;

    if (merchant_status === 'Allow') {
      // Find the corresponding merchant
      const merchant = await Merchant.findOne({ _id: withdrawal.merchantID });

      if (!merchant) {
        // Merchant not found
        return res.status(404).json({ error: 'Merchant not found' });
      }

      // Calculate the updated merchant amount

      const updatedMerchantAmount = merchant.amount - withdrawal.amount;

      if (updatedMerchantAmount < 0) {
        // Insufficient balance
        return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
      }

      // Update the merchant amount
      merchant.amount = updatedMerchantAmount;
      await merchant.save();
    }
    else if(merchant_status === 'Cancel'){
      const merchant = await Merchant.findOne({ _id: withdrawal.merchantID });

      if (!merchant) {
        // Merchant not found
        return res.status(404).json({ error: 'Merchant not found' });
      }

      const updatedMerchantAmount = merchant.amount; 
      // Update the merchant amount
      merchant.amount = updatedMerchantAmount;
      await merchant.save();
    }

    // Save the withdrawal
    await withdrawal.save();

    // Return a response indicating the status update
    res.json({ message: 'Merchant status updated successfully' });
  } catch (error) {
    console.error('An error occurred while updating the merchant status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


MerchantRoute.patch('/edit', async (req, res) => {
  const user = await Merchant.findById({ _id: req.body.userId });
  try {
    if (user) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      const updated = await Merchant.findByIdAndUpdate({ _id: req.body.userId }, req.body);
      console.log(updated);
      return res.status(200).json({ message: 'user updated successfully' });
    } else {
      return res.status(401).json('user not found');
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json('Error in user update');
  }
});

MerchantRoute.get('/users', async (req, res) => {
  const merchantId = req.body.userId;
  const users = await User.find({ merchant_id: merchantId });
  return res.status(200).json(users);
});

MerchantRoute.delete('/delete/withdrawal/:id', async (req, res) => {
  const mid = req.body.userId;
  const wid = req.params.id;
  try {
    await Withdrawal.findOneAndDelete({ withdrawal_id:wid, merchantID:mid});
    return res.status(200).json("withdrawal deleted success")
  } catch (error) {
    return res.status(401).json("error while deleting withdrawal")
  }
});

MerchantRoute.get('/dashboard/data', async (req, res) => {
  try {
    const totalAmount = await Withdrawal.aggregate([
      {
        $match: {
          merchantID: req.body.userId
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const requestCount = await Withdrawal.countDocuments({ merchantID: req.body.userId });

    const successAmount = await Withdrawal.aggregate([
      {
        $match: {
          merchantID: req.body.userId,
          bank_status: "SUCCESSFULLY"
        }
      },
      {
        $group: {
          _id: null,
          successAmount: { $sum: "$amount" }
        }
      }
    ]);

    const uniqueUsers = await Withdrawal.distinct("user_id", { merchantID: req.body.userId }).count();

    return res.status(200).json({
      totalAmount: totalAmount[0]?.totalAmount || 0,
      requestCount,
      successAmount: successAmount[0]?.successAmount || 0,
      uniqueUsers,
    });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching dashboard data' });
  }
});

MerchantRoute.post("/revert/withdrawal/:id",async(req,res)=>{
      const {id} = req.params;
      try {
         const withdrawal  = await Withdrawal.findOne({withdrawal_id:id,merchantID:req.body.userId});
         if(withdrawal){

            withdrawal.merchant_status = "Pending"
            withdrawal.bank_status = "Pending"
            withdrawal.admin_status = "Pending"
            withdrawal.createdAt = Date.now();

            const merchant = await Merchant.findById({_id:withdrawal.merchantID});
            if(merchant){
              merchant.amount -= withdrawal.amount;
              await merchant.save();
            }else{
              return res.status(401).json({error:"Merchant not found or valid"})
            }
            await withdrawal.save();
            return res.status(200).json({message:"revert success"})
         }else{
          return res.status(401).json({error:"withdrawal not found"})
         }
      } catch (error) {
        return res.status(500).json({error:"Problem with revert back"})
      }
})



module.exports = MerchantRoute;
