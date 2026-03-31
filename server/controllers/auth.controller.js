const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const {connectionPool}=require('../database_access');

const cookieOptions={
    httpOnly : true,
    secure : process.env.NODE_ENV==='production',
    sameSite : process.env.NODE_ENV==='production' ? 'strict' : 'lax',
    maxAge : 7*24*3600*1000
};

async function registerUser(req,res){
    function invalidInput(res){
        return res.status(400).json({
            success : false,
            message : 'Incomplete credentials!'
        });
    }
    const {formData}=req.body;
    const {name,email,password}=formData;
    if(!name || !email || !password) return invalidInput(res);

    try{
        const [check]=await connectionPool.query('select 1 from users where email=?',[email]);
        if(check.length>0)
            return res.status(409).json({
                success : false,
                message : 'Email already in use'
            });
        const conn=await connectionPool.getConnection();
        try{
            await conn.beginTransaction();
            const salt=await bcrypt.genSalt(10);
            const hashedPassword=await bcrypt.hash(password,salt);
            const [result]=await conn.query(`insert into users (name,email,password,role) values (?,?,?,'patient')`,[name,email,hashedPassword]);
            const userId=result.insertId;
            const {gender,blood_group,dob}=formData;
            if(!gender || !blood_group || !dob) 
            {
                conn.rollback();
                return invalidInput(res);
            }
            await conn.query('insert into patient (patient_id,gender,blood_group,dob) values (?,?,?,?)',[userId,gender,blood_group,dob]);
            await conn.commit();
            return res.status(202).json({
                success : true,
                message : 'User successfully registered!'
            })
        }catch(err){
            console.log(err);
            await conn.rollback();
            return res.status(500).json({
                success : false,
                message : 'Some error ocurred! Please try again!'
            });
        }finally{
            conn.release();
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error ocurred! Please try again!'
        });
    }
}

async function loginUser(req,res){
    try{
        const {formData}=req.body;
        const {email,password}=formData;
        const [check]=await connectionPool.query('select * from users where email=?',[email]);
        if(check.length===0)
            return res.status(401).json({
                success : false,
                message : 'Invalid email or password'
            });
        const matched= process.env.TESTING==='doctor' ? password===check[0]['password'] : await bcrypt.compare(password,check[0]['password']);
        
        if(!matched)
            return res.status(401).json({
                success : false,
                message : 'Invalid email or password'
            });
        const payload={
            id : check[0]['user_id'],
            role : check[0]['role']
        };
        const expiresIn=300;
        const accessToken=jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn});
        const refreshToken=jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{expiresIn : 7*24*3600});

        res.cookie('refreshToken',refreshToken,cookieOptions);

        return res.status(200).json({
            success : true,
            message : 'Successfully logged in.',
            accessToken,
            expiresIn
        });
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : 'Some error ocurred. Please try again.'
        });
    }
}

async function refreshUser(req,res){
    try{
        const {refreshToken}=req.cookies;
        if(!refreshToken)
            return res.status(400).json({
                success : false,
                message : 'No refresh token found!'
            });
        const decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET);
        const [check]=await connectionPool.query('select * from users where user_id=?',[decoded.id]);
        if(check.length===0)
        {
            res.clearCookie('refreshToken');
            return res.status(401).json({
                success : false,
                message : 'Expired or invalid refresh token!'
            });
        }
        const payload={
            id : check[0]['user_id'],
            role : check[0]['role']
        };

        const expiresIn=300;
        const accessToken=jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn});
        const refresh_token=jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{expiresIn : 7*24*3600});

        res.cookie('refreshToken',refresh_token,cookieOptions);

        return res.status(200).json({
            success : true,
            message : 'Successfully refreshed.',
            accessToken,
            expiresIn
        });

    }catch(err){
        return res.status(401).json({
            success : false,
            message : 'Expired or invalid refresh token'
        });
    }
}

async function logoutUser(req,res){
    try{
        const {refreshToken}=req.cookies;
        if(refreshToken)
        {
            const {maxAge,...clearOptions}=cookieOptions;
            res.clearCookie('refreshToken',clearOptions);
        }
        return res.status(200).json({
            success : true,
            message : 'User successfully logged out'
        })
    }catch(err){
        res.status(500).json({
            success : false,
            message : 'Some error ocurred! Please try again.'
        })
    }
}


module.exports={registerUser,loginUser,refreshUser,logoutUser}
