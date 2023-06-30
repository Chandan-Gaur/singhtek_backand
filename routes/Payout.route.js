const express = require("express");
const User = require("../models/Users.model");
const Payout = require("../models/Payout.model");
const PayoutRoute = express.Router();

PayoutRoute.get("/",(req,res)=>{
    return res.status(200).json("Payout")
})

PayoutRoute.post("/pay/",async(req,res)=>{
    const user_id = '6469c3af44b168ca8bf055e8'
    try {
        const { txn_id, txn_mode, bank_id, amount, remarks } = req.body;
    
        // Find the user by ID
        const user = await User.findById(user_id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        // Create a new payout
        const payout = new Payout({
          user_id: user._id,
          merchant_id: user.merchant_id,
          txn_id,
          txn_mode,
          bank_id,
          amount,
          remarks
        });
    
        // Save the payout
        await payout.save();
    
        res.status(201).json(payout);
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
module.exports = PayoutRoute