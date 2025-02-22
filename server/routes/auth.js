require("dotenv").config();
const nodemailer = require("nodemailer");
const OTPModel = require("../Models/otp");
const User = require("../Models/user");
const bcrypt=require("bcryptjs");
const { fetchUser } = require("../Middlewares/fetchUser");
const express= require("express");
const jwt= require("jsonwebtoken");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to Gmail:", error);
  } else {
    console.log("Connected to Gmail:", success);
  }
});

router.post("/send-otp",async(req,res)=>{
    const {email}=req.body;
    console.log(email);         

    try{
        let user= await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({ success:false,msg: "A User with this email already exists" });
        }
    
       const otp = Math.floor(100000 + Math.random() * 900000); 
       await OTPModel.create({ email, otp, createdAt: new Date() });
       console.log(otp);
       transporter.sendMail(
            {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your Login OTP",
                text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
            },
        );
      res.status(200).json({success:true, msg: "OTP sent successfully" });
    }catch(e){
       console.log(e);
       res.status(404).send({ success:false,msg: 'Failed to send OTP' });
    }
})
router.post("/verify-otp", async (req, res) => {
    const {email, password, Name,Institute, DOB, Mobile, Gender,role, idType, idNumber,otp}=req.body;
  try{   
        if (!email || !otp || !Name || !Institute||!password || !DOB||!Mobile||!role||!Gender||!idType||!idNumber) {
            return res.status(400).json({ success: true, msg: "All fields are required" });
        }
        console.log(otp);
        const uer = await User.findOne({ email });
        if (uer) return res.status(400).json({success:false, msg: "User already exists with this email" });

        const validOtp = await OTPModel.findOne({email, otp });
        console.log(validOtp);
        if (!validOtp|| new Date() - new Date(validOtp.createdAt) > 5 * 60 * 1000) {
            return res.status(400).json({ success:false, msg: "Invalid or expired OTP" });
        }
        console.log(validOtp._id);
        await OTPModel.deleteOne({ _id: validOtp._id });
        const isUser = await User.findOne({ email });
        if (isUser) return res.status(400).json({success:false, msg: "User already exists with this email" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ 
            email, 
            password: hashedPassword,  
            Name, 
            Institute, 
            DOB, 
            Mobile, 
            Gender, 
            idType, 
            idNumber, 
            role 
        });
        await user.save();

        
        const accessToken = jwt.sign({ user }, process.env.TOKEN, { expiresIn: "36000m" });
        res.status(200).json({ success:true, user, accessToken, msg: "Signup successful" });
    }
    catch(e){
       res.status(500).json({success:false,e,msg:"Couldn't verify OTP"});
    }
  });
router.post("/login", async (req, res) => {
  try { 
    const {email ,password}=req.body;
     let user= await User.findOne({email});
     console.log(user);
     if(!user){
         return res.status(401).json({ success:"false", msg: "User doesn't exists" });
     }
     let passwordSync= await bcrypt.compare(password,user.password);
     if(!passwordSync){
         return res.status(401).json({success:"false", msg: "Please enter correct Credentials" });
     }
     let data={
         user:{
           id:user.id
         }
     }
     const accessToken = jwt.sign({ user }, process.env.TOKEN, { expiresIn: "36000m" });
     res.status(200).json({ success:true, msg: "Successfully authenticated!!", accessToken });
 } catch (error) {
     console.error(error);
     res.status(500).send({success:"false",msg: 'Failed to save user' });
 }
  });
router.get("/get-user", fetchUser, async (req, res) => {
    const { user } = req.user;
  try{
    const isUser = await User.findOne({ _id: user._id });
    console.log({ user });
    if (!isUser) {
      return res.status(401);
    }
    res.status(200).json({
      user,
      msg: ""
    });
  }
  catch(e){
    res.status(500).json({success:false,e,msg:"Unable to fetch users details"});
   }
  });
  
  module.exports = router;