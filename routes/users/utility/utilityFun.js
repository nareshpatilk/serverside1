var utility = require('express').Router();
var passport =  require(`passport`);
var Request = require('request');
var http  = require('http');
var appRoot = require('app-root-path');
var cache = require('express-redis-cache')();
var logger = require(`${appRoot}/config/winston/winston.config`);
const PlayerDatabaseSchema =require(`${appRoot}/model/playerSchema`);
const videoDetailsall = require(`${appRoot}/model/videoDetailsSchema`);
var ObjectId = require('mongoose').Types.ObjectId; 
var jwt = require('jsonwebtoken');
var hashSecret = require(`${appRoot}/config/hashPasswordSecret/hashpass`);
var transporter = require(`${appRoot}/config/Mailer/mail`);
var ObjectId = require('mongoose').Types.ObjectId;  

//Get players list
/* URL : /players/ *///
utility.get('/player', cache.route('playerList', 36000),async (req, res) => {
    

    var players = await PlayerDatabaseSchema.playerDetails.find({});
    var t20 = await PlayerDatabaseSchema.tTwenty.find({});
    var odi= await PlayerDatabaseSchema.oneDayInternational.find({});
    var test = await PlayerDatabaseSchema.testMatch.find({});
    res.status(200).json({ 'players': players, 't20': t20, 'odi': odi, 'test': test });
});

//Get players list
/* URL : /players/id *///
utility.get('/player/:id',cache.route('playerIndivial', 36000),async (req, res) => {
    var pid = req.params.id;
   
    try{

        const players = await PlayerDatabaseSchema.playerDetails.find({ _id:  new ObjectId(pid)});
        if(players){
            const  t20 = await PlayerDatabaseSchema.tTwenty.find({ playerID: pid });
            const odi = await PlayerDatabaseSchema.oneDayInternational.find({ playerID: pid });
            const test = await PlayerDatabaseSchema.testMatch.find({ playerID: pid });
            res.status(200).json({ 'players': players, 't20': t20, 'odi': odi, 'test': test });
        }else{
            res.status(500).json({ 'error': 'no such player found!!' });
        }
       
    }catch(e){
        logger.error(e);
        console.log(e);
        res.status(500).json({ 'error': 'no such player found!!' });
    }
    
});



//auth with google
utility.get('/google',passport.authenticate('google',{
    scope:['profile','email']
}));


utility.get('/google/redirect',passport.authenticate('google'),(req, res) => {
       
    var token = jwt.sign(req.user.userName, hashSecret.HASHPASS);
    let conURL = "/jwttoken/"+token+"/user/"+req.user.userName+"/type/"+req.user.userType+"/id/"+req.user._id;
    res.redirect("http://localhost:4200/home"+conURL); 
    
    
});


//cache.route('videoDetails', 36000)//
utility.get('/videoAll', fecthDataMW,errorVEH, (req, res) => {
    logger.info("Succes videoAll Fetched")
});
//
utility.get('/getComments/:videoID', fecthDataCommentMW ,(req,res) => {
    logger.info("get Videos comment Fetched")
},errorCEH);
//
utility.post('/addComments',jwtTokenVerify, insertToMW,errorCIEH,(req,res) => {
    logger.info("added Videos comment ")
});

utility.post('/getCountLDval',async (req,res) => {
    try{
    let videoId =  req.body.id;
    //console.log('heyeeeeeee',videoId)
    //videoID = videoId.inde
    let mainQry = { _id: new ObjectId(videoId)} 
    console.log('mainQry',mainQry)
    let mainData = await videoDetailsall.videoDetailsSchema.findOne(mainQry);
    //console.log('mainData>>>>',mainData)
        if(mainData)
            res.status(200).json({data:mainData});
    }catch(e){
        console.log(e);
        logger.error(e)
        res.status(500).json({error:"Internal Server Error"});
    }
});
utility.post('/endPointlikes',async (req,res) => {
    try {
    const videoID = req.body.videoID;
    const userID = req.body.userID;
    const dislikeVal = req.body.dislikeVal;
    const likeVal = req.body.likeVal;

    let mainLike;
    let mainDislike;
    let userLDfg;

    
    logger.info("inside endpoint like ",videoID,' ',userID,' ',dislikeVal,' ',likeVal);
    let mainQry = { _id: new ObjectId(videoID)} 
    let mainData = await videoDetailsall.videoDetailsSchema.findOne(mainQry);
    
    mainLike = (mainData.likes == likeVal ) ?  mainData.likes: likeVal;
    mainDislike = (mainData.disLikes == dislikeVal ) ?  mainData.disLikes: dislikeVal;

    //if user disliked lk wont be same
    userLDfg = (mainData.likes != likeVal ) ? true: false;
    
    const body = {likes: mainLike,disLikes:mainDislike};
    let updateMainData = await videoDetailsall.videoDetailsSchema.findOneAndUpdate(mainQry,body,{new: true});

    const userlikendislike = await videoDetailsall.videoLikeStatus.findOne({$and:[ {videoID:videoID}, {userID:userID}]})

    const videolikedislikeSaveArr = {
        videoID:videoID,
        userID:userID,
        likes:userLDfg,
    };
    if(!userlikendislike){
        const inslikesDislikes = await new videoDetailsall.videoLikeStatus(videolikedislikeSaveArr).save();
    }else{
        const likebody = { likes : userLDfg};
        const likequery = {$and:[ {videoID:videoID}, {userID:userID}]};
        const videoDetailsLike = await videoDetailsall.videoLikeStatus.findOneAndUpdate(likequery, likebody,{ new: true });
        logger.info(videoDetailsLike)
    }
    //console.log(err)
    res.status(200).json(updateMainData);
    // if(mainData.likes == likeval)
    //     mainLike = mainData.likes;
    // else
    //     mainLike = likeval;
    // if(mainData.disLikes == dislikeVal)
    //     mainDislike = mainData.disLikes;
    // else
    //     mainDislike = likeval;
    }catch(e){
        console.log(e)
        res.status(500).json({error: "Couldn't Update"});
    }
});

function  jwtTokenVerify   (req, res, next)  {
    logger.info('VERIFY TOKEN Started: ');
    let val = jwt.verify(req.headers.authentication,hashSecret.HASHPASS);
    logger.info('VERIFY TOKEN: ',val);
    next();
}
function  fecthDataMW(req, res, next){
    logger.info("REQUEST for VIDEO ALL")
    videoDetailsall.videoDetailsSchema.find({},(err, result) => {
            if(err) {
                logger.info('FAILED: VIDEO FETCH ',err);
                res.status(500).json({ 'error': 'Internal Server Error!!!' }); 
                next(err);
            }
            else{
                logger.info('SUCCESS: VIDEO FETCH ');
                res.status(200).json({data: result});
            next();
            }
    });
}

function errorVEH(err, req, res, next){
    if(err){  
        logger.error( 'GET all VIdeo Eroor',err );
        res.status(500).json({ error: 'Video  get failed' });
        //next();
    }else
        next();
return;
}



function fecthDataCommentMW(req, res, next ){
    console.log(req.params)
    
    var videoQry = (req.params);
    logger.info("TO GET COMMENTS/GETCOMMENTS ALL")
  
    videoDetailsall.videoComment.find(videoQry, (err, result) => {
        if(err){
            
            next(err)
        }else{
            logger.info("VIDEOS FOR COMMENT FETCHED > ",result) 
            res.status(200).json({videosComments:result})
            next();
        }
    })
}

function errorCEH(err, req, res, next){
    if(err){  logger.error( 'Comment get failed',err );
     res.status(500).json({ error: 'VComment get failed' });
    }else
        next();
return;
}
function errorCIEH(err, req, res, next){
    if(err){  logger.error( 'Comment Insert failed',err );
        res.status(500).json({ error: 'VComment insert failed' });
    }else
        next();
return;
}


function insertToMW(req, res, next ){
    logger.info("INSERT CHAT MW",req.body);
    
    

    var videoComment = new videoDetailsall.videoComment;
    videoComment.videoID = req.body.videoId;
    videoComment.createdDate = new Date();
    videoComment.ModifiedDate = new Date();
    videoComment.userID = req.body.userId;
    videoComment.userName = req.body.userName;
    videoComment.comments = req.body.comments;

    videoComment.save(function (err, data) {
        if (err) {
           console.log(err);
           next(err);
        } else {
            res.status(200).json({ 'message': 'Comment inserted successfully!!!' });
            next();
        }
    });
}

utility.get('/', (req, res) => {
    res.status(200).json({ message: 'Inside The  utility' });
})
utility.use(jwtTokenVerify);
utility.use(fecthDataCommentMW);
utility.use(fecthDataMW);
utility.use(errorVEH);
utility.use(errorCEH);
utility.use(errorCIEH);


module.exports = utility;