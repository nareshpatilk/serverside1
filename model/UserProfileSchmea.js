var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    fullName: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    address: String,
    accountID:String,
    primeUser: {
         type: Number,default: 0 // 0 -> normal 1-> prime
    },
    userStatus: {
        type: Number,default: 1 // 0 -> NOactive 1-> active
    },
    createdDate: {
        type: Date, default: Date.now 
    },
    modifiedDate: {
        type: Date, default: Date.now 
    }


})

// var addressSubschema = new Schema({
//     address: String,
//     number: String,
//     zip: String,
//     city: String,
//     state: String,
//     country:String
// })



var userAccountSchema = new Schema({
    userName: { type: String, required: true, unique : true },
    //userName: { type: String, required: true },
    password: String,
    pFullName: String,
    oAuthSource: String,
    oAuthID: String,
    accountStatusFlag: { type: Number,default: 1},//0 -> not active 1 -> active
    userType: { type: Number,default: 0},//0 -> normal user 1 - > admin
    primeUser: { type: Number,default: 0}, // 0 -> normal 1-> prime
    createdDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now }

});

userAccountSchema.pre('save', next => {
    now = new Date();
    if(!this.createdDate) {
    this.createdDate= now;
    }
    next();
    }); 
userAccountSchema.pre('save', next => {
    now = new Date();
    if(!this.modifiedDate) {
    this.modifiedDate= now;
    }
    next();
    }); 

    userSchema.pre('save', next => {
    now = new Date();
    if(!this.createdAt) {
    this.createdAt = now;
    }
    next();
    }); 
var usersProfile =  mongoose.model('usersProfile', userSchema);
var userAccountDetails = mongoose.model('userAccountDetails', userAccountSchema);

module.exports = {
    usersProfile:usersProfile,
    userAccountDetails:userAccountDetails
};