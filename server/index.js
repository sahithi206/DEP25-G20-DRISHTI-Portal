require("dotenv").config();
const cors = require("cors");
const express= require ("express");
const Auth=require("./routes/auth");
const Form =require("./routes/form");
const mongoose = require("mongoose");


const app = express();

/*const corsConfig = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],  
};


*/
const PORT=process.env.PORT||5000
app.use(cors( ))
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
   try{
    console.log(process.env.URL);
    await mongoose.connect(process.env.URL)
    console.log("MongoDB Connected");
   }
   catch(error){
    console.error(error);
   }
    
}

connectDB();