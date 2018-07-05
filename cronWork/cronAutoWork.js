let express = require('express');
const appRoot = require('app-root-path');
let router = express.Router();
let bodyParser = require('body-parser');
var http = require('http');
const cronJob = require('node-schedule');
const logger = require(`${appRoot}/config/winston/winston.config.js`);
var syncLoop = require('sync-loop');

const PlayerDatabaseSchema = require(appRoot + '/model/playerSchema');

let apiKey = "Y2axmnJkhzVXMIutP3SES49Znwz1";

let addPlayer = function (player,callBackFun) {
    const playerDetails = new PlayerDatabaseSchema.playerDetails;
    const testMatch = new PlayerDatabaseSchema.testMatch;
    const oneDayInternational = new PlayerDatabaseSchema.oneDayInternational;
    const tTwenty = new PlayerDatabaseSchema.tTwenty;

    playerDetails.playerName = player.name;
    playerDetails.playerType = player.playingRole;
    playerDetails.profileImage = player.imageURL;
    playerDetails.profileDescription = player.profile;
    playerDetails.playerAPIId = player.pid;
    playerDetails.playerFlag = true;
    playerDetails.createdDate = new Date();

    //tTwenty.playerID = player.pid;
    tTwenty.matchesPlayed =player.data.batting.T20Is.Mat;
    tTwenty.totalRunSored =player.data.batting.T20Is.Runs;
    if(player.data.bowling.T20Is.Wkts==="-")
    {   tTwenty.average =0;    }
   else
    {   tTwenty.average =player.data.batting.T20Is.Ave;   }

    
    tTwenty.totalHundreads =player.data.batting.T20Is['100'];
    tTwenty.totalFifties =player.data.batting.T20Is['50'];
    if(player.data.bowling.T20Is.Wkts==="-")
    {   tTwenty.wicketsTaken =0;    }
    else
    {   tTwenty.wicketsTaken =player.data.bowling.T20Is.Wkts;   }

    if(player.data.bowling.T20Is.Wkts==="-")
    {   tTwenty.economy =0;    }
    else
    {   tTwenty.economy =player.data.bowling.T20Is.Econ;   }
   
    tTwenty.topScore ="";

    //oneDayInternational.playerID = player.pid;
    oneDayInternational.matchesPlayed =player.data.batting.ODIs.Mat;
    oneDayInternational.totalRunSored =player.data.batting.ODIs.Runs;
    oneDayInternational.average =player.data.batting.ODIs.Ave;
    oneDayInternational.totalHundreads =player.data.batting.ODIs['100'];
    oneDayInternational.totalFifties =player.data.batting.ODIs['50'];
    oneDayInternational.wicketsTaken =player.data.bowling.ODIs.Wkts;
    oneDayInternational.economy =player.data.bowling.ODIs.Econ;
    oneDayInternational.topScore ="";

    //testMatch.playerID = player.pid;
    testMatch.matchesPlayed =player.data.batting.tests.Mat;
    testMatch.totalRunSored =player.data.batting.tests.Runs;
    testMatch.average =player.data.batting.tests.Ave;
    testMatch.totalHundreads =player.data.batting.tests['100'];
    testMatch.totalFifties =player.data.batting.tests['50'];
    testMatch.wicketsTaken =player.data.bowling.tests.Wkts;
    testMatch.economy =player.data.bowling.tests.Econ;
    testMatch.topScore ="";

    //logger.info("playerDetails : "+JSON.stringify(playerDetails));
    playerDetails.save((error, result) => {
        if (error) throw error;

        logger.info("Player inserted !!!");
    
        tTwenty.playerID = result._id;
        //logger.info("tTwenty : "+JSON.stringify(tTwenty));
        tTwenty.save((error1, result1) => {
            if (error1) throw error1;

            logger.info("T20 inserted !!!");
            oneDayInternational.playerID = result._id;
            //logger.info("oneDayInternational : "+JSON.stringify(oneDayInternational));
            oneDayInternational.save((error2, result2) => {
                if (error2) throw error2;
    
                logger.info("ODI inserted !!!");
                testMatch.playerID = result._id;
                //logger.info("testMatch : "+JSON.stringify(testMatch));
                testMatch.save((error3, result3) => {
                    if (error3) throw error3;
        
                    logger.info("Test inserted !!!");
                    callBackFun();
                });
            });
        });
    });
}

var PIdList = ["253802","28081","36084","34102","35263","625371"];
var numberOfLoop = PIdList.length;
let body = '';

var j = cronJob.scheduleJob('* * 23 * 1 *', function () { 
    logger.info("Cron job started");
   
    syncLoop(numberOfLoop, function (loop) {
        var index = loop.iteration(); 

        logger.info("index : "+index);
        let pid = PIdList[index];
                    
        let url = `http://cricapi.com/api/playerStats/?apikey=${apiKey}&pid=${pid}`;
        logger.info("url : "+url);

        let urlencodeParser = bodyParser.urlencoded({ extended: false });

        let request = http.request(url, (response)=>{
            response.on('data', function (chunk) {
                body += chunk;
            });

            response.on('end', function () {
                var player = JSON.parse(body);
                logger.info("Came here with pid : "+pid)
                addPlayer(player,()=>{
                    body = "";
                    loop.next(); // call `loop.next()` for next iteration
                });
            });
        }).end();
    }, function () {
        console.log("Data inserted successfully!!!")
    });  
})    

module.exports=router;
