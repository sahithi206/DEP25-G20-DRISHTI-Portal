require("dotenv").config();
const nodemailer = require("nodemailer");
const OTPModel = require("../Models/otp");
const User = require("../Models/user");
const Admin = require("../Models/Admin");
const Institute = require("../Models/instituteID");
const bcrypt = require("bcryptjs");
const { fetchUser } = require("../Middlewares/fetchUser");
const { fetchAdmin } = require("../MiddleWares/fetchAdmin");
const express = require("express");
const jwt = require("jsonwebtoken");
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

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success: false, msg: "A User with this email already exists" });
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
    res.status(200).json({ success: true, msg: "OTP sent successfully" });
  } catch (e) {
    console.log(e);
    res.status(404).send({ success: false, msg: 'Failed to send OTP' });
  }
})
router.post("/forgot-passwordotp", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ success: false, msg: "No user with this email exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await OTPModel.create({ email, otp, createdAt: new Date() });
    console.log(otp);
    transporter.sendMail(
      {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Recovery",
        text: `Your OTP for Password Recovery is: ${otp}. It is valid for 5 minutes.`,
      },
    );
    res.status(200).json({ success: true, msg: "OTP sent successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, e, msg: "Couldn't Send OTP" });
  }
})
router.post("/forgot-password", async (req, res) => {
  const { email, password, otp } = req.body;
  try {
    if (!email || !otp || !password) {
      return res.status(400).json({ success: true, msg: "All fields are required" });
    }
    console.log(otp);
    const uer = await User.findOne({ email });
    if (!uer) return res.status(400).json({ success: false, msg: "User doesn't exists with this email" });

    const validOtp = await OTPModel.findOne({ email, otp });
    if (!validOtp || new Date() - new Date(validOtp.createdAt) > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    }
    await OTPModel.deleteOne({ _id: validOtp._id });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const isUser = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    res.status(200).json({ success: true, msg: "Password is Successfully Changed!!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, e, msg: "Couldn't Change Password" });
  }
})
router.post("/verify-otp", async (req, res) => {
  const { email, password, Name, Institute, DOB, Mobile, Gender, role, idType, idNumber, otp, address, Dept } = req.body;
  try {
    if (!email || !otp || !Name || !Institute || !password || !DOB || !Mobile || !role || !Gender || !idType || !idNumber || !address || !Dept) {
      return res.status(400).json({ success: true, msg: "All fields are required" });
    }
    console.log(otp);
    const uer = await User.findOne({ email });
    if (uer) return res.status(400).json({ success: false, msg: "User already exists with this email" });

    const validOtp = await OTPModel.findOne({ email, otp });
    console.log(validOtp);
    if (!validOtp || new Date() - new Date(validOtp.createdAt) > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    }
    console.log(validOtp._id);
    await OTPModel.deleteOne({ _id: validOtp._id });
    const isUser = await User.findOne({ email });
    if (isUser) return res.status(400).json({ success: false, msg: "User already exists with this email" });

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
      role,
      Dept,
      address
    });
    await user.save();


    const accessToken = jwt.sign({ user }, process.env.TOKEN, { expiresIn: "36000m" });
    res.status(200).json({ success: true, user, accessToken, msg: "Signup successful" });
  }
  catch (e) {
    console.log(e);
    res.status(500).json({ success: false, e, msg: "Couldn't verify OTP" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ success: "false", msg: "User doesn't exists" });
    }
    let passwordSync = await bcrypt.compare(password, user.password);
    if (!passwordSync) {
      return res.status(401).json({ success: "false", msg: "Please enter correct Credentials" });
    }
    let data = {
      user: {
        id: user.id
      }
    }
    const accessToken = jwt.sign({ user }, process.env.TOKEN, { expiresIn: "36000m" });
    res.status(200).json({ success: true, msg: "Successfully authenticated!!", accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: "false", msg: 'Failed to save user' });
  }
});
router.get("/get-user", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(403).json({ success: false, msg: "Unauthorized Access" });
    }
    res.status(200).json({ success: true, user, msg: "User Details Fetched" });
  }
  catch (e) {
    res.status(500).json({ success: false, e, msg: "Unable to fetch users details" });
  }
});
router.post("/get-pi", async (req, res) => {
  const { email } = req.body
  try {
    const isUser = await User.findOne({ email: email }).select({ "email": 1, "Name": 1, "Institute": 1, "DOB": 1, "Mobile": 1, "Gender": 1, "address": 1, "Dept": 1, "role": 1 });
    console.log(isUser);
    if (!isUser) {
      return res.status(200).json({ success: false, msg: "PI/Co-pi doesn't exist" });
    }
    res.status(200).json({ success: true, isUser, msg: "User Details Fetched" });
  }
  catch (e) {
    res.status(500).json({ success: false, e, msg: "Unable to fetch users details" });
  }
});

router.post("/edit-user", fetchUser, async (req, res) => {
  try {
    const { Name, email, DOB, Mobile, Gender, Dept, idType, idNumber, address } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ success: false, msg: "Unauthorized Access" });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, msg: "Fill at least one field" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { Name, email, DOB, Mobile, Gender, Dept, idType, idNumber, address } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    console.log("Updated User:", updatedUser);
    res.status(200).json({ success: true, user: updatedUser, msg: "User Details Edited" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

router.post("/change-password", fetchUser, async (req, res) => {
  const { currentPassword, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Incorrect current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword }, { new: true });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Changed",
      text: `Your password for ${user.email} has been successfully changed. If this wasn't you, please contact support.\n\nBest Regards,\nAdmin Team`,
    });

    res.status(200).json({ success: true, msg: "Password changed successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, e, msg: "Couldn't Change Password" });
  }
})

router.post("/create-institute", async (req, res) => {
  const { email, password, college, otp } = req.body;

  try {
    const validOtp = await OTPModel.findOne({ email, otp });
    if (!validOtp || new Date() - new Date(validOtp.createdAt) > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    }

    let institute = await Institute.findOne({ email });
    if (institute) {
      return res.status(400).json({ success: false, msg: "An Institute with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newInstitute = new Institute({ email, password: hashedPassword, college });
    await newInstitute.save();

    await OTPModel.deleteOne({ _id: validOtp._id });

    const accessToken = jwt.sign({ institute: newInstitute }, process.env.TOKEN, { expiresIn: "36000m" });
    res.status(201).json({ success: true, msg: "Institute user created successfully", institute: newInstitute, accessToken });
  } catch (error) {
    console.error("Error creating institute user:", error.message);
    res.status(500).json({ success: false, msg: "Failed to create institute user", error: error.message });
  }
});

router.post("/institute-login", async (req, res) => {

  try {
    const { email, password } = req.body;
    const institute = await Institute.findOne({ email });
    if (!institute) {
      return res.status(401).json({ success: false, msg: "Institute not found" });
    }

    const passwordMatch = await bcrypt.compare(password, institute.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, msg: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ institute }, process.env.TOKEN, { expiresIn: "36000m" });
    res.json({ success: true, msg: "Institute logged in successfully", accessToken });
  } catch (error) {
    console.error("Error logging in institute:", error.message);
    res.status(500).json({ success: false, msg: "Failed to log in institute", error: error.message });
  }
});

router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, msg: "User doesn't exist" });
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, msg: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.TOKEN, { expiresIn: "1h" });

    res.status(200).json({
      success: true,
      msg: "Login successful",
      accessToken: token,
      role: user.role // Send role to frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

router.post("/admin-verify-otp", async (req, res) => {
  const { email, password, name, role, otp } = req.body;
  try {
    console.log("In the /admin-verify-otp");
    if (!email || !otp || !name || !password || !role) {
      return res.status(400).json({ success: true, msg: "All fields are required" });
    }
    console.log(otp);
    const uer = await Admin.findOne({ email });
    if (uer) return res.status(400).json({ success: false, msg: "Admin already exists with this email" });

    const validOtp = await OTPModel.findOne({ email, otp });
    console.log(validOtp);
    if (!validOtp || new Date() - new Date(validOtp.createdAt) > 5 * 60 * 1000) {
      return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    }
    console.log(validOtp._id);
    await OTPModel.deleteOne({ _id: validOtp._id });
    const isUser = await Admin.findOne({ email });
    if (isUser) return res.status(400).json({ success: false, msg: "User already exists with this email" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new Admin({
      name,
      email,
      password: hashedPassword,
      role
    });
    await user.save();


    const accessToken = jwt.sign({ user }, process.env.TOKEN, { expiresIn: "36000m" });
    res.status(200).json({ success: true, user, accessToken, msg: "Signup successful" });
  }
  catch (e) {
    console.log(e);
    res.status(500).json({ success: false, e, msg: "Couldn't verify OTP" });
  }
});

router.get("/get-admin", fetchAdmin, async (req, res) => {
  try {
    console.log("Admin Details:", req.admin);
    const admin = await Admin.findById(req.admin.id).select("-password"); // Exclude password field
    if (!admin) {
      return res.status(404).json({ success: false, msg: "Admin not found" });
    }

    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Internal server error" });
  }
});


module.exports = router;
