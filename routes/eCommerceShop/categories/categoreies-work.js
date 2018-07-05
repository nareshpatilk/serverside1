const route       = require('express').Router();
const appRoot     = require('app-root-path');
const logger      = require(`${appRoot}/config/winston/winston.config`);
const bcrypt      = require('bcryptjs');
const shoppingSchema = require(`${appRoot}/model/ShoppingSchema`);
const hashSecret  = require(`${appRoot}/config/hashPasswordSecret/hashpass`);
const jwt         = require('jsonwebtoken');
const transporter = require(`${appRoot}/config/Mailer/mail`);
var ObjectId = require('mongoose').Types.ObjectId


//jwtTokenVerify
route.post('/category-save', async (req, res) => {
    try{
        logger.info('SAVE CATEGORY',req.body);
        let result = await shoppingSchema.categoryProduct(req.body).save();
         if(result){
            res.status(200).json({ DATA: 'Success Saved' });
        }else{
            res.status(500).json({ error: 'Save Unsuccessfull' });
        }
    }catch(e){
        console.log(e);
        res.status(500).json({ error: 'Save Unsuccessfull' });
    }
},categorySaveEH);

route.delete('/category-delete',(req, res) => {
    res.status(200).json({ message: 'category -delte  routes' })
});

route.get('/get-category', async (req, res) => {
    
    let result = await shoppingSchema.categoryProduct.find({});
    logger.info('GET CATEGORY',result )
    if(result)
        res.status(200).json({ data : result })
    else
        res.status(400).json({error: " Resource Not found" });
});



route.get("/", (req, res) => {
    res.status(200).json({ message: 'categorier  routes' });
});

function categorySaveEH(err, req, res, next ){
    if(err){
        logger.error(`CATEGORY SAVE ERROR ${err}`);
        console.log(err);
        res.status(404).json({error:"Internal Server Error"});
    }
    return;
}


//jsttokenveify
route.get("/get-cart-details/:id", async (req,res) => {
    try{
    let userId = req.params.id;
    // 
    let totalPrice = 0.0;
    let searchQry = {userId: new ObjectId(userId)};
    
    let result =  await shoppingSchema.cartdetails.find({userId: new ObjectId(userId),product_active:true,cart_status:true});
    if(result){
        result.forEach(function(element) {
            totalPrice = totalPrice + element.productPrice;
            console.log(">>>>>>>>>>>>>"+element.productPrice,"<<<<<<<<",totalPrice)
        }, this);
              
        res.status(200).json({success:"Fetched Record",data:result,totalPrice:parseFloat(totalPrice)})
    }else
        res.status(400).json({error:"Bad Request"})

   

    }catch(err){
        console.log(err);
        logger.error("Errot to retrive",err)
        res.status(500).json({error:"Internal Server Error"})
    }
})

route.post('/delete-myproduct',async (req, res) => {
    console.log("ccccccccccccccccccc",req.body.cartId)
     let idQry = req.body.cartId;
     console.log("ccccccccccccccccccc",req.body.cartId)
     try{
        let mainQry = {_id:req.body.cartId};
        let updQry = {cart_status:false,product_active:false};
        let result = await shoppingSchema.cartdetails.findOneAndUpdate(mainQry,updQry,{new: true});
        if(result)
            res.status(200).json({success:"Product Deleted"})
        else
            res.status(400).json({error:"No Product Found"})

     }catch(e){
         console.log(e);
         logger.error(e);
         res.status(500).json({error:"Internal Server Error"});
     }
    res.status(200).json({success:"Delete Record"})
});


route.post('/order-my-product', async (req, res) => {
    try{
        console.log('>>>>>>>>>>>>>>',req.body.userID);
        let qry = {userId: req.body.userId};
        let productIds = [];
        let cartIds = [];
        let totalPrice = 0;
        let result = await shoppingSchema.cartdetails.find(qry);
       
        if(result){
            result.forEach(element => {
                productIds.push(element.productId);
                cartIds.push(element._id);
                totalPrice = totalPrice + element.productPrice;
            });
            console.log("cartIds>>>>>",totalPrice,productIds,cartIds);
            

            
           

            var  orderDetails  = new shoppingSchema.orderdetails;
            orderDetails.userID =     req.body.userId;
            orderDetails.productID=  productIds;
            orderDetails.totalPrice= totalPrice;
            orderDetails.cartId=     cartIds;
            orderDetails.orderStatus=  'Ordered';
            
            console.log(orderDetails)
            
           let  mainResult = await  orderDetails.save(); 
           
            
       
            if(mainResult) {
                let srchqry = {"userId":req.body.userId,"cart_status":true,"product_active":true};
                let updateQry = { $set: { "cart_status" : false }};
                let cartUpdate = await shoppingSchema.cartdetails.updateMany(
                   { $and: [{"userId":req.body.userId},{"cart_status":true},{"product_active":true}]},
                    { $set: { "cart_status" : false }},
                                                                            {multi: true}
                                                                            );
                if(cartUpdate)
                    res.status(200).json({success:"Ordered Succesfully"});
                else
                    res.sendStatus(400).json({error:"Bad Request"});

                
            }else{
                res.status(500).json({error:"Order Was Not Successfull"})
            }
        }else{
            res.status(400).json({error:"Order was not successfull"});
        }
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Internal Server Error"});
    }
});

// function  jwtTokenVerify   (req, res, next)  {
//     logger.info('VERIFY TOKEN Started: ');
//     let val = jwt.verify(req.headers.authentication,hashSecret.HASHPASS);
//     logger.info('VERIFY TOKEN: ',val);
//     next();
// }
// route.use(categorySaveEH);
module.exports = route;