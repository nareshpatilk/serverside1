const passport = require('passport');
const googleStrategy = require('passport-google-oauth20');
var appRoot = require('app-root-path');
var logger = require(`${appRoot}/config/winston/winston.config`);
const googleapi  = require('./googleapi');
var userProfile = require(`${appRoot}/model/UserProfileSchmea`);




passport.serializeUser((user,done) => {
    done(null,user);
});

passport.deserializeUser((id,done) => {
    userProfile.userAccountDetails.findbyId(id).then((user) =>{
        done(null,user);
    });
});

passport.use(
    new googleStrategy({
        callbackURL: '/check/utility/google/redirect',
        clientID:googleapi.google.clientID,
        clientSecret:googleapi.google.clientSecret
 }, (accessToken,refreshToken,info,done) => {
    logger.info("got details from google and valid",info);
    console.log(info.id);
    console.log(info.displayName);
    console.log(info.emails[0].value);

    
    userProfile.userAccountDetails.findOne({oAuthID:info.id}).then((currentUser) => {
        if(currentUser){
            logger.info("user is "+currentUser);
            done(null,currentUser);
        }else{

            var accData = {userName:info.emails[0].value,oAuthSource:'google',oAuthID:info.id};
            
                var acoountData = new userProfile.userAccountDetails(accData);
                acoountData.save((err, data) =>{
                        if(err){
                          
                            logger.error(err);
                            res.status(500).json(err);
                        }
                        else
                            {
                                var userData = {fullName:info.displayName,email:info.emails[0].value,accountID:data._id};
                                var useProfileData = new userProfile.usersProfile(userData);
                                useProfileData.save((err,data) => {
                                        if(err){
                                            res.status(500).json(err);
                                            throw err;
                                        }
                                        else{
                                            done(null,data);
                                        }
            
                                });
                            }
                });

        }

    });

   
    return;
  
 })
);