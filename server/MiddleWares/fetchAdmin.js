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