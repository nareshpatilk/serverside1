
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

let category = new Schema({
    categoryName : String
    }); 

let Products = new Schema({

    name        :     { type : String, unique : true,
                        required : [true, 'Product name is must'] }, 

    quantity    :     { type : Number, 
                        required : [true, 'Product quantity is must'] }, 

    category_id :     { type: mongoose.Schema.Types.ObjectId, ref:'category',
                        required : [true, 'Catergory is must'] },

    description :     { type:String },

    image       :     { type : String, 
                        required : [true, 'Product image is must'] }, 

    price       :     { type : Number, 
                        required : [true, 'Product price is must'] }, 
                        flag : { type : Boolean, default : true } 
    });
    
    var cartSchema = new Schema({

    productsName:   {   type: String    },
    productImg:     {   type: String    },
    productId:      {   type: String    },
    productCat:     {   type: String    },
    productQty:     {   type: Number    },
    productPrice:   {   type: Number    },
    product_active: {   type: Boolean, default : true},
    userId:         {   type: mongoose.Schema.Types.ObjectId, ref:'useraccountdetails',
                        required : [true, 'user id is must'] },
    cartcreate_date:{   type: Date, default: Date.now },
    cartmodify_date:{   type: Date, default: Date.now },
    cart_status:    {   type: Boolean,  default : true } 

    
    });

    //date update 
    
    cartSchema.pre('update', function(next)  { 
                now = new Date();
                this.cartmodify_date= now;
            next();
     }); 
    

    var orderDetailsSchema = new Schema({
    userID:             String,
    productID:          [String],
    cartId:             [String],
    totalPrice:         Number,
    orderStatus:        String,
    ordercreate_date:{   type: Date, default: Date.now },
    ordermodify_date:{   type: Date, default: Date.now }
    });  

    orderDetailsSchema.pre('save', function(next) { 
        now = new Date();
        if(!this.ordermodify_date) {
        this.ordermodify_date= now;
        next();
    }
   next();
}); 


var categoryProduct =  mongoose.model('categoryProduct', category );
var products        =  mongoose.model('products', Products);
var cartdetails     =  mongoose.model('cartdetails', cartSchema);
var orderdetails    =  mongoose.model('orderdetails', orderDetailsSchema);

 module.exports = {
        
        products        :    products,
        categoryProduct :    categoryProduct,
        cartdetails     :    cartdetails, 
        orderdetails    :    orderdetails
  } 