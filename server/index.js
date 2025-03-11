require("dotenv").config();
const cors = require("cors");
const express= require ("express");
const Auth=require("./routes/auth");
const Form =require("./routes/form");
const mongoose = require("mongoose");
const app = express();
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

mongoose.connect(process.env.URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));