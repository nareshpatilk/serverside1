const videoStreaming = require('express').Router();
const http = require('http');
const https = require('https');
const appRoot = require('app-root-path');
const cronJob = require('node-schedule');
const axios = require('axios');
const logger = require(`${appRoot}/config/winston/winston.config.js`);
var channelName = 'indian cricket 2018';
var body = '';
var loopNumber = 20;
const videoDataModel = require(`${appRoot}/model/videoDetailsSchema`);
let appKey = "AIzaSyBvT941ftm7l5bCZo1Shz4S62zNbPz_Dm8";

var fetchData = async function(){
    logger.info("inside fetch data");

    var details = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=indian%20cricket%202018&maxResults=${loopNumber}&key=${appKey}`);
    
    return details.data.items;    
}

var addVideo = function (video) {
    const videoRecord = new videoDataModel.videoDetailsSchema;

    logger.info("data saving in process");

    videoRecord.videoDescription=video.snippet.description;
    videoRecord.videoYtID= video.id.videoId;
    videoRecord.videoURL = "";
    videoRecord.videoDuration= "";
    videoRecord.likes= 0;
    videoRecord.disLikes= 0;
    videoRecord.videoTitle=video.snippet.title;
    videoRecord.createdDate = new Date();
    videoRecord.thumbnails =  video.snippet.thumbnails.default.url;

    videoRecord.save((err, result) => {
        if (err) {
            logger.error("error", err);
        } else {
            logger.info("data is saved");
            //return;
        }
    })
};
//*/20 * * * * *
var j = cronJob.scheduleJob('* * 23 * 1 *', async function () {
    logger.info("Entered videos cronJob");
    var videodetails;
    videodetails = await fetchData();

    for (var index = 0; index < videodetails.length; index++) {
        var videoItems = videodetails[index];
        addVideo(videoItems);
    }

    console.log("Data inserted successfully");
});

module.exports = videoStreaming;
