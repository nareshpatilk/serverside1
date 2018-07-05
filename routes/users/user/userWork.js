var userWork = require('express').Router();
var appRoot = require('app-root-path');
var logger = require(`${appRoot}/config/winston/winston.config`);
var bcrypt = require('bcryptjs');
var userProfile = require(`${appRoot}/model/UserProfileSchmea`);
var hashSecret = require(`${appRoot}/config/hashPasswordSecret/hashpass`);
var jwt = require('jsonwebtoken');
var transporter = require(`${appRoot}/config/Mailer/mail`);
//const crediantials = require(`${appRoot}/mailerConst`);
var  nodemailer  =  require('nodemailer');

const authCheck = (res,req,next) => {
    
    if(!req.user){
        // if user is not looged in
        res.redirect('/auth/login');
    }else{
        next();
    }
};

userWork.get("/userAddProduct", (req, res) => {
    logger.info("userAdd product get m()");
    res.status(200).json({ message: 'user addproducts' });
    return;
});

userWork.get("/userDeleteProduct", (req, res) => {
    logger.info("userDeleteProduct product get m()");
    res.status(200).json({ message: 'user deleteproducts' });
    return;
});

userWork.get("/", (req, res) => {
    res.status(200).json({ message: 'user route' });
    return;
});

userWork.get("/profile",authCheck, (req, res) => {
    res.send('you are logged in ',req.user.userName);
    return;
});


userWork.post("/register",checkUserCreditianls,hashPassword,  (req,res) => {
    
    logger.info(` user registration fun()`);
    var body = req.body;

    var userNameEmail = body.email;//email
    var fullName = body.fullName;
    var password = body.password;
    var oAuthSource = body.oAuthSource;
    var oAuthID = body.oAuthID;
    var phonenumber = body.phonenumber;
    var address = body.address;
    var accData = {userName:userNameEmail,password:password,oAuthSource:oAuthSource,oAuthID:oAuthID,pFullName:fullName};
   
    var acoountData = new userProfile.userAccountDetails(accData);
    acoountData.save((err, maindata) =>{
            if(err){
              
                logger.error(err);
                res.status(500).json(err);
            }
            else
                {
                    var userData = {fullName:fullName,email:userNameEmail,accountID: maindata._id,phonenumber:phonenumber,address:address}
                    var useProfileData = new userProfile.usersProfile(userData);
                    useProfileData.save((err,data) => {
                            if(err){
                                res.status(500).json(err);
                                throw err;
                            }
                            else{
                                
                                transporter.mailOptions.to= `${userNameEmail}`,
                                transporter.mailOptions.text= `<h1> Dear ${fullName} <h1> <br> This is you Email : ${userNameEmail}.`,
                                transporter.transporter.sendMail(transporter.mailOptions,(err, info) => {
                                        if(err) console.log("Email Failed",err)
                                        else console.log("success sent mail")
                                });
                                res.status(200).json({msg:"Success"});
                            }

                    });
                }
    });
    // try{
    // var resDataParent = await acoountData.save((err, maindata) );
    //     logger.info('here',resDataParent);
    // var userData = {fullName:fullName,email:userNameEmail,accountID: resDataParent._id,phonenumber:phonenumber,address:address}
    // var useProfileData = new userProfile.usersProfile(userData);
    //  var resDataChild = await  useProfileData.save((err,data));
    //  logger.info('child',resDataChild);
    //  res.status(200).json({msg:"Success",mainData:resDataParent});
    // }catch (err){
    //     res.status(500).json({err: "Users Registration Not Success!"});
    //     throw err;
    // }

    
    
    return;
});

// middleware
function hashPassword(req, res, next){
    logger.info('hash password middle ware invoked');
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

    next();
};

userWork.post("/login",checkCreditianls, JwtTokenGenerate ,(req, res) => {
    logger.info("login action m()");
   
    var data = req.userDetails;
    res.send({data:data,token:req.token,success:"Succes Login"});
    
    return;
});

function checkCreditianls(req, res, next){
    logger.info("user credientials check"+(JSON.stringify(req.body)));
    var body = req.body;
    var userName = body.email;
    var password = body.password;
    logger.info("userName"+userName,"password>>",password);
    var fg = false;
    userProfile.userAccountDetails.findOne({userName:userName},(err,result) => {
       if(!result){
         res.status(500).json({error: 'User Not Found Please Register'});
         req.tokenSuccess = false;
         next();
       }else{
        bcrypt.compare(password,result.password, (err, isMatch) => {
            if(err){
                fg =true;
                logger.error("bcrypt hash error");
                
                req.tokenSuccess = false;
                req.userDetails = result;
                res.status(500).json({error: 'becryp err'});
            }else if(!isMatch){
                fg =true;
                logger.info("bcrypt hash password not matched");
                
                req.tokenSuccess = false;
                req.userDetails = result;
                res.status(500).json({ error: 'Password not matched'});
            }else{
                logger.info("hashing password macthed");
                req.tokenSuccess = true;
                // !important do here 
                req.userDetails = result;
                next();
            }
        });
        
            }//here
    });
    
    
    if(fg)
        next();
    
}
function JwtTokenGenerate(req, res, next) {
    logger.info("JwtTokenGenerate token generate");
    var data = {
        userName : req.body.email//email is username
     };
    
    //  var token = jwt.sign(data, hashSecret.HASHPASS);
    var token = jwt.sign(data, hashSecret.HASHPASS,{expiresIn: 60 * 60});
    logger.info('token generated '+req.tokenSuccess);

    if(req.tokenSuccess){
        res.header('jwttoken',token);
        req.token = token;
    }
    next();
}

function checkUserCreditianls(req, res, next){
    logger.info("user Email check"+(JSON.stringify(req.body)));
    var body = req.body;
    var userName = body.email;
   
    logger.info("user Email check "+userName);
   
    userProfile.userAccountDetails.findOne({userName:userName},(err,result) => {
       if(result){
         res.status(500).json({error: 'User Email Already Present'});
         logger.info("err",err);
        }else
            next();
        
    });
    return;
}
userWork.use(authCheck);
userWork.use(hashPassword);
userWork.use(JwtTokenGenerate);
userWork.use(checkCreditianls);
userWork.use(checkUserCreditianls);
module.exports = userWork;