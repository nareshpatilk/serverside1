const route       = require('express').Router();
const appRoot     = require('app-root-path');
const logger      = require(`${appRoot}/config/winston/winston.config`);
const bcrypt      = require('bcryptjs');
const shoppingSchema = require(`${appRoot}/model/ShoppingSchema`);
const hashSecret  = require(`${appRoot}/config/hashPasswordSecret/hashpass`);
const jwt         = require('jsonwebtoken');
const transporter = require(`${appRoot}/config/Mailer/mail`);

route.get("/product", (req, res) => {
    res.status(200).json({ message: 'product  routes' });
});

//jwtTokenVerify
route.post('/product-save', async (req,res) => {

    logger.info('SAVE Product',req.body);
    
    let result = await shoppingSchema.products(req.body).save();
     if(result){
        res.status(200).json({ DATA: 'Product Success Saved' });
    }else{
        res.status(500).json({ error: ' Product Save Unsuccessfull' });
    }
   
});

route.put('/product-qty-update',(req,res) => {
    res.status(200).json({ message: ' product-qty-update  routes' });
});

route.patch('/product-rate-update',(req,res) => {
    res.status(200).json({ message: ' product-rate-update  routes' });
});

route.delete('/product-delete',(req,res) => {
    res.status(200).json({ message: ' product-delete  routes' });
});

route.delete('/product-delete',(req,res) => {
    res.status(200).json({ message: ' product-delete  routes' });
});

route.get('/get-product/:id' ,async (req, res) => {
    try{
        logger.info("GET PRODUCT DETAILS > LOGGED")
        let srchQry = req.params.id
        let result = await shoppingSchema.products.findOne({_id:srchQry});
            if(result)
                res.status(200).json({sucess:"product Got",data:result});
            else
                res.status(404).json({error:"Request not Found"})
            logger.info("GET PRODUCT DETAILS > RESULT>",result);
    }catch(error){
        console.log(error);
        logger.error("GET PRODUCT BY ID ERROR")
        res.status(500),json({error:"Internal Server Error"})
    }
   
res.status(200).json({data: " Sucess product id "})
});
route.get('/get-products',  async (req,res) =>{
    logger.info("PRODUCTS GET ")
    let result = await shoppingSchema.products.find({});
    if(result)
        res.status(200).json({data:result});
    else
        res.status(500).json({error:"No Recorf Found"})
    //console.log()
    
});

route.post('/filtercategory',async (req, res) => {
    console.log('filtercategory',req.body);
    try{
        let searchQry =  req.body.category_id;
        
        let result  = await shoppingSchema.products.find({ category_id: { $in: searchQry } })
           
        if(result)
            res.status(200).json({success:"Fetched Product",data: result})
        else
            res.status(404).json({error: 'No Record Found'})
            
    }catch(e){
        console.log(e);
        res.status(500).json({error: 'Internal Server Error'})
    }
})
//jwtTokenVerify
route.post('/add-to-cart', async  (req, res) => {
          
            const productId = req.body.productId;
            const userId    = req.body.userId;
            // cart can be added from detail and or list 
            const frmlistRdet = req.body.fromPlace;//if from list false // from detail true
            const qtydefault = req.body.qty ;
            const searchQry = {productId:productId,userId:userId,product_active:true,cart_status: true};
            
     try{
        // first check already same product and user id is there
        const checkdataexists = await  shoppingSchema.cartdetails.findOne(searchQry);
        const productdetailsmain = await shoppingSchema.products.findById({_id:productId});
        console.log('checkdataexists>>>>>',checkdataexists)
        if(checkdataexists && productdetailsmain){
            let qty = checkdataexists.productQty + 1;
            let price = checkdataexists.productPrice + productdetailsmain.price;
            if(frmlistRdet){
                console.log("from DDDDDDDDDDDDD checkdataexists.productQty",checkdataexists.productQty)
                
                qty = parseFloat(checkdataexists.productQty) + parseFloat(qtydefault);
                price = parseFloat(productdetailsmain.price) * parseFloat(qty);
                console.log("from DDDDDDDDDDDDD qty",qty," <<>",price)
            }

            let updateCartData = {
                productPrice: price,
                productQty:qty
            }
            //cart id 
            let mainqry = {_id:checkdataexists._id}
            const updatecart =await shoppingSchema.cartdetails.findOneAndUpdate(mainqry,updateCartData,{new: true});
            if(updatecart)
                res.status(200).json({success:"Cart Updated Success"})
            else
                res.status(404).json({error:"Cart Updated Failed"})
            console.log("UPPPPPPPPPPPPP",updatecart)
         } else{
            
            // const productdetails = await shoppingSchema.products.findById({_id:productId});
            const data = {
                productsName:   productdetailsmain.name,
                productImg:     productdetailsmain.image,
                productId:      productdetailsmain._id,
                productCat:     productdetailsmain.category_id,
                productQty:     qtydefault,
                productPrice:  parseFloat(productdetailsmain.price) * parseFloat(qtydefault),
                userId:         userId
            }
            const savetocart = await shoppingSchema.cartdetails(data).save();
            if(savetocart)
                res.status(200).json({success:"Cart Added Successfull"})
            else
                res.status(404).json({error:"Not Added To Cart"})
            console.log("saveeeeeeee",savetocart)
        }
     }catch(err){
         console.log(err);
         res.status(500).json({error: "Internal Server Error"})
     }               
           
});

// function  jwtTokenVerify   (req, res, next)  {
//     logger.info('VERIFY TOKEN Started: ');
//     let val = jwt.verify(req.headers.authentication,hashSecret.HASHPASS);
//     logger.info('VERIFY TOKEN: ',val);
//     next();
// }


//route.use(jwtTokenVerify);
module.exports = route;