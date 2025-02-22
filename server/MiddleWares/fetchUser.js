
const jwt = require("jsonwebtoken");
const JWT_SECRET=process.env.TOKEN

const fetchUser=(req,res,next)=>{
    try{
        let token=req.header('auth-token');
        if(!token){
            return res.status(401).send("Authenticate using a valid token");
        }
        const string=jwt.verify(token,JWT_SECRET);
        req.user=string.user;
        next();
    }catch(error){
        console.error("Token verification failed:", error.message);
        res.status(401).json({ error: "Invalid token, please authenticate using a valid token" });
    }

}
module.exports={fetchUser};