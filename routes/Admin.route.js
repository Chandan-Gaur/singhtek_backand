const express = require('express');
const SinghtekUser = require('../models/SinghTekUsers.model');
const Merchant = require('../models/Merchant.model');
const User = require('../models/Users.model');
const Admin = require('../models/Admin.model');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
require('dotenv').config();
const AdminRoute = express.Router();

AdminRoute.get("/",(req,res)=>{
    return res.status(200).json("Admin")
})

AdminRoute.post('/register', async (req, res) => {
  console.log(req.body)
  try {
    const { email, password } = req.body;

    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin instance
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();

    res.status(200).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

AdminRoute.post('/login',async(req,res)=>{
    
    const user = await Admin.findOne({email:req.body.email});
    // console.log(req.body)
    if(user){
      // compare hashed password with plain password
        try {
          bcrypt.compare(req.body.password,user.password,(err,result)=>{
            if(result){
              //on success generate token for user
                 const token = jwt.sign({userId:user._id},process.env.TOKEN_KEY);
                 return res.status(200).json({'token':token})
            }
        })
        } catch (error) {
          console.log(error)
         return res.status(401).json({error:"error while admin login"}) 
        }
    }else{
      return res.status(401).json('No user found')
    }
    
})

AdminRoute.use(auth)


AdminRoute.post("/sub-admin/register", async (req, res) => {
  console.log(req.body)
  try {
    const { username, department, first_name, email, designation, mobile_no, user_type, last_name, password, image, docsFile } = req.body;
    // Check if the username or email already exists
    const existingUser = await SinghtekUser.findOne({ email: email });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new SinghtekUser instance
    const singhtekUser = new SinghtekUser({
      username,
      department,
      first_name,
      email,
      designation,
      mobile_no,
      user_type:'sub-admin',
      last_name,
      password: hashedPassword,
      image,
      docsFile,
    });

    // Save the SinghtekUser to the database
    await singhtekUser.save();
    res.status(201).json({ message: 'SinghtekUser signed up successfully' });
  } catch (error) {
    console.error('Error signing up SinghtekUser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

AdminRoute.get('/SinghTekUsers',async(req,res)=>{
    try {
        // Find all Singhtek users
        const singhtekUsers = await SinghtekUser.find();
        res.json(singhtekUsers);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
AdminRoute.get('/Merchants',async(req,res)=>{
    try {
        // Find all Merchant users
        const MerchantUsers = await Merchant.find();
        res.json(MerchantUsers);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})
AdminRoute.get('/Users',async(req,res)=>{
    try {
        // Find all users
        const Users = await User.find();
        res.json(Users);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

module.exports = AdminRoute