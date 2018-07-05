var express = require('express');
var router = express.Router();
var userInside = require('./users/routesInnerController');
var shopInside = require('./eCommerceShop/shoproute');


router.get("/", (req, res) => {
    res.status(200).json({ message: 'Inside The  routes' });
});

// router.use(function (req, res, next) {
//     console.log("heeeeee re middle ware")
//     if (!req.headers['_XTX']) return next('router')
//     next()
// });
router.use(function(req, res, next){
    console.log('Time',Date.now())
    
    next();
  })
router.use("/check", userInside);
router.use("/shop", shopInside);


module.exports = router;
