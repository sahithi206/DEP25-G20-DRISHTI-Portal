require("dotenv").config();
const cors = require("cors");
const express= require ("express");
const Auth=require("./routes/auth");
const Form =require("./routes/form");
const mongoose = require("mongoose");
const app = express();
const schemeRoutes = require("./routes/schemeRoutes");
const fundCycleRoutes = require("./routes/fundCycleRoutes");
const requestRoutes = require("./routes/requestRoutes");
const institute = require("./routes/institute");
const PORT=process.env.PORT||5000
const Project=require("./routes/project.js");
app.use(cors( ))
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Connected!!!");
});

app.use("/auth",Auth);
app.use("/form",Form);
app.use("/projects", Project);
app.use("/schemes", schemeRoutes);
app.use("/fundCycles", fundCycleRoutes);
app.use("/requests", requestRoutes);
app.use("/institute", institute);   



app.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
});

mongoose.connect(process.env.URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));
