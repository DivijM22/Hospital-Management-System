const jwt=require('jsonwebtoken');

async function handleAuth(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader?.split(' ')[1];
    if(!authHeader || !token)
        return res.status(401).json({
            success : false,
            message : 'Access token absent!'
        });
    try{
        const decoded=jwt.verify(token,process.env.JWT_ACCESS_SECRET);
        req.user=decoded;
        next();
    }catch(err){
        return res.status(401).json({
            success : false,
            message : 'Invalid or expired token'
        });
    }
}

async function handleAccess(req,res,next){
    const {user}=req;
    if(user.role==='patient')
        return res.status(403).json({
            success : false,
            message : 'Not authorized'
        });
    next();
}

async function checkAdmin(req,res,next){
    const {user}=req;
    if(user.role!=='admin')
        return res.status(403).json({
            success : false,
            message : 'Admin access required'
        });
    next();
}

module.exports={handleAuth,handleAccess,checkAdmin};