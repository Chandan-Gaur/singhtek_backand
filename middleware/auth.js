const jwt = require("jsonwebtoken")
require("dotenv").config()
const auth = (req,res,next)=>{
    // console.log(req.headers)
    const token = req.headers?.authorization?.split(" ")[1];
    // console.log(token);
    try {
        if(token){
            const decode = jwt.verify(token,process.env.TOKEN_KEY)
            // console.log(decode);
            if(decode){
                const userId = decode.userId;
                req.body.userId = userId;
                // console.log(userId);
                next();
            }else{
                res.status(500).json({message:"Invalid Credential"})
            } 
        }else{
            res.status(500).json({message:"You are not Authorize user"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Problem with auth"})
    }
}
module.exports={
    auth
}