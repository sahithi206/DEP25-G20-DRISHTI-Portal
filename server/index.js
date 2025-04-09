require("dotenv").config();
const cors = require("cors");
const express = require("express");
const Auth = require("./routes/auth");
const Form = require("./routes/form");
const mongoose = require("mongoose");
const app = express();
const schemeRoutes = require("./routes/schemeRoutes");
const fundCycleRoutes = require("./routes/fundCycleRoutes");
const requestRoutes = require("./routes/requestRoutes");
const institute = require("./routes/institute");
const PORT = process.env.PORT || 5000
const Project = require("./routes/project.js");
const Admin = require("./routes/admin.js");
const Upload = require("./routes/upload.js");

const Quotations = require("./routes/quotations.js");
const UCComment = require("./routes/ucComments.js");
const UCRoutes = require("./routes/UCRoutes.js");
const SERoutes = require("./routes/SERoutes.js");
const ExpenseComment = require("./routes/expenseComments.js");


app.use(cors())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// app.use(express.json());


// Add this to your Express server setup
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Backend Connected!!!");
});

app.use("/uc", UCRoutes);
app.use("/se", SERoutes);
app.use("/auth", Auth);
app.use("/form", Form);
app.use("/admin", Admin);
app.use("/upload", Upload);
app.use("/projects", Project);
app.use("/institute", institute);
app.use("/schemes", schemeRoutes);
app.use("/quotations", Quotations);
app.use("/uc-comments", UCComment);
app.use("/requests", requestRoutes);
app.use("/fundCycles", fundCycleRoutes);
app.use("/expense-comments", ExpenseComment);


app.listen(PORT, () => {
  console.log(`Server is running on PORT : ${PORT}`);
});

mongoose.connect(process.env.URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));
