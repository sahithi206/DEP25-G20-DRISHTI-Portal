require("dotenv").config();
const cors = require("cors");
const express= require ("express");
const Auth=require("./routes/auth");
const Form =require("./routes/form");
const mongoose = require("mongoose");


const app = express();

const PORT = process.env.PORT||5000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Connected!!!");
});

app.use("/auth",Auth);
app.use("/form",Form);
app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
});

const connectDB = async()=>{
<<<<<<< HEAD
    console.log(process.env.URL)
=======
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
   try{
    await mongoose.connect(process.env.URL)
    console.log("MongoDB Connected");
   }
   catch(error){
    console.error(error);
   }
    
}

connectDB();