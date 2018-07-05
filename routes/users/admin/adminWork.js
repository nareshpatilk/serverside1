var adminWork = require('express').Router();
var appRoot = require('app-root-path');
var cache = require('express-redis-cache')(); 
var logger = require(`${appRoot}/config/winston/winston.config`);
const chaterBoxs =require(`${appRoot}/model/ChatBoxSchema`);
var userProfile = require(`${appRoot}/model/UserProfileSchmea`);


adminWork.get("/addProduct", (req, res) => {
    res.status(200).json({ message: 'admin addproducts' });
});

adminWork.get("/deleteProduct", (req, res) => {
    res.status(200).json({ message: 'admin deleteproducts' });
});

adminWork.get("/", (req, res) => {
    res.status(200).json({ message: 'admin work  routes' });
});

adminWork.get("/fetchchat", cache.route('chatQuestions', 36000),fecthQA, (req,res) => {
    logger.info("chat box fetch")
     //res.status(200).json({ message: 'chat  fetch' });
});

adminWork.post("/insertChatQA", insertQA, errorHandlerInsert, (req,res) => {
    logger.info("chat box insert");
    res.status(200).json({ message: 'chat  insert' });
 });

adminWork.get('/get-myprofile/:accountID', async (req, res) => {
    logger.info("get profile");
    console.log("get my profile");

    let qry = {accountID:req.params};
    console.log('>>>>>>>>>>>',qry);
    let result = await userProfile.usersProfile.findOne(req.params);
    if(result)
        res.status(200).json({data:result,success:"Fetched profile"})
    else
        res.status(404).json({error:"Bad Request"})
}) 
adminWork.post("/profile-update", async (req, res) => {
    logger.info("PROFILE UPDATE");
    console.log("Profile updatation")
    console.log(req.body);

    let userId = req.body.userId;
    let fullName = req.body.fullName;
    let phoneNumber = req.body.phoneNumber;
    let address = req.body.address;

    let srhQry = {accountID:userId}
    let bodydata = {fullName:fullName,phoneNumber:phoneNumber,address:address};
    let mainBody = {pFullName:fullName};
    let mainQry = {_id:userId}
    try{
        let result = await userProfile.usersProfile.findOneAndUpdate(srhQry,bodydata,{upsert:true})
        if(result){
            let mainupdate = await userProfile.userAccountDetails.findOneAndUpdate(mainQry,mainBody,{upsert:true})
            if(mainBody){
                console.log("main data updateeeeeee")
                res.status(200).json({success:"Profile Updated"})
            }else{
                console.log("main data faileeeeeee")
                res.status(400).json({error:"Profle Update Failed"})
            }
        }else{
            console.log("failed updated");
            res.status(400).json({error:"Bad Request"})
        }
    }catch(err){
        console.log(err);
        logger.error("erorrr",err);
        res.status(500).json({error:"Internal Server Error"})
    }
})
function fecthQA(req, res, next) {
    
    logger.info("middlware chat");
    chaterBoxs.chaterBox.find({},(err,result) => {
       if(err){  res.status(500).json({error: 'No history'});
         logger.err("err",err);
        }else{  logger.info(result);
            res.status(200).json({data: result});
        }
        next();
    });
    
   
}


function insertQA(req, res, next){

    logger.info("middlware insert chat");
    var data = {question: req.body.question, answer: req.body.answer};
   
    if(!req.body.question){  logger.error("insert not proper");
       next(err);
    }
     var chatinsert = new chaterBoxs.chaterBox(data);
     chatinsert.save((err,result) => {
         if(err){ logger.error("insert failed chat");
             next(err);
         }else{ logger.info("sucess inserted",result);
             next();
         }
     });
     return;
}

function errorHandlerInsert(err,req,res,next){
    if(err){  res.status(500).json({ error: 'chat  inserted failed' });
        logger.error( 'error chat  inserted failed' );
    }else
        next();
    return;
}
adminWork.use(errorHandlerInsert);
adminWork.use(insertQA);
adminWork.use(fecthQA);
module.exports = adminWork;