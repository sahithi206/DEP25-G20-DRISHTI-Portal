// Middleware to authenticate and fetch institute details from the provided access token.
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.TOKEN;

const fetchInstitute = (req, res, next) => {
  try {
    let token = req.header('accessToken');
    if (!token) {
      return res.status(401).send("Authenticate using a valid token");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.institute = decoded.institute;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid token, please authenticate using a valid token" });
  }
};

module.exports = { fetchInstitute };