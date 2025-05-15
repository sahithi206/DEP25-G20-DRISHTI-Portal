// Middleware to authenticate and fetch admin details from the provided access token.
// This middleware verifies the token, decodes it, and attaches the admin details to the request object.
// If the token is invalid or missing, it returns a 401 Unauthorized error.

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.TOKEN

const fetchAdmin = (req, res, next) => {
    try {
        let token = req.header('accessToken');
        if (!token) {
            return res.status(401).send("Authenticate using a valid token");
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        res.status(401).json({ error: "Invalid token, please authenticate using a valid token" });
    }

}
module.exports = { fetchAdmin };