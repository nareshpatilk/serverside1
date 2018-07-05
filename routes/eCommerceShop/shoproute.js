const route = require('express').Router();

const categoryRoute = require('./categories/categoreies-work');
const productRoute = require('./products/product-work');

route.use('/categories',categoryRoute);
route.use('/products',productRoute);
    

route.get("/", (req, res) => {
    res.status(200).json({ message: 'shop  routes' });
});

module.exports = route;