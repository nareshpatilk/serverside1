const innerRoute = require('express').Router();

const adminRoute = require('./admin/adminWork');
const userRoute = require('./user/userWork');
const utilityRoute = require('./utility/utilityFun');

innerRoute.use('/admin',adminRoute);
innerRoute.use('/user',userRoute);
innerRoute.use('/utility',utilityRoute);
    

innerRoute.get("/", (req, res) => {
    res.status(200).json({ message: 'check  routes' });
});

module.exports = innerRoute;