const product = require('../models/products')
const order = require('../models/order');

function initRoutes(app){

    //Index Page
    app.get("/",(req,resp)=>{
        product.find().then(
            function (products) {
                return resp.render('customer/index', { products: products })
                
            }
        )
    })

    app.get('/product/:id',(req,resp)=>{
        product.find({_id:req.params.id}).then(
            function (products) {
                return resp.render('customer/productDetails', { products: products })
            }
        )
    })

    app.get('/cart',(req,resp)=>{
        return resp.render('customer/cart')
    })

    app.get('/signup',(req,resp)=>{
        return resp.render('registration')
    })

    app.get('/login',(req,resp)=>{
        return resp.render('login')
    })

    //Logout 
    app.get('/logout', (req, resp) => {
        req.session.user = null
        resp.redirect('/')
    });

    //Checkout
    app.get('/checkout',(req,resp)=>{
        if(req.session.user){
            return resp.render('customer/checkout')
        }
    })

    //Myorder
    app.get('/customer/order', async (req, resp) => {

        if (req.session.user) {
            order.find({ customerId: req.session.user._id }).then(
                function (order) {
                    return resp.render('customer/order', { order: order }, null, { sort: { 'createdAt': -1 } })
                }
            )
        } else {
            return resp.redirect('/')
        }
        // console.log(orders)
    })

    app.get('/customer/:ids', (req, resp) => {
        var a = []
        if (req.session.user) {
            order.findById(req.params.ids).then(function (order) {

                if(req.session.user._id.toString() === order.customerId.toString())
                {
                parsedItems = Object.values(order.item)
                parsedItems.map((menuItem) => {
                    a.push(menuItem)
                })
                return resp.render('customer/myorder', { order: order, a: a })
            }else{
               return resp.render('notfound')
            }
            })
        } else {
            resp.redirect('/')
        }
    });

    //Admin 
    app.get('/admin',(req,resp)=>{
        if(req.session.user && req.session.user.role === 'admin'){
        return resp.render('admin/home')
        }else{
            console.log("permission Required")
        }
    })

    //Admin Orders
    app.get('/admin/order', (req, res) => {
        if(req.session.user && req.session.user.role === 'admin'){
        order.find({ status: { $ne: 'c' } }, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password')
        .exec((err, order) => {
            if(req.xhr){
                return res.json(order)
            }else{
                return  res.render('admin/order')
            }
            // return resp.render('admin/order',{order:order})
        })
    }else{
        return res.render('notfound')
    }
    })

    //Admin Add Product
    app.get('/admin/product',(req,resp)=>{
        if(req.session.user.role === 'admin'){
            return resp.render('admin/addproduct')
        }else{
            resp.redirect('/')
        }
    })

    app.get('/admin/product/remove',(req,resp)=>{
        product.find().then(
            function (products) {
                return resp.render('admin/delete', { products: products })
            }
        )
    })

    //Delete Product
    app.get('/admin/product/remove/:id',async(req,resp)=>{
        if(req.session.user.role==='admin')
        {
        await product.deleteOne({_id:req.params.id}).then(()=>{
            resp.redirect('/admin')
        })
    }else{
        return resp.render('notfound')
    }
    })

    //update Product
    app.get('/admin/product/update/:id',async(req,resp)=>{
        if(req.session.user.role==='admin')
        {
            product.findOne({_id:req.params.id}).then(
                function (products) {
                    return resp.render('admin/update',{products:products})
                }
            )
        
    }else{
        return resp.render('notfound')
    }
    })

    //shipping Policy
    app.get('/shipping-policy',(req,resp)=>{
       return resp.render('shippingPolicy')
    })

    //Privacy Policy
    app.get('/privacy-policy',(req,resp)=>{
        return resp.render('privacyPolicy')
     })

     //Terms
     app.get('/terms',(req,resp)=>{
        return resp.render('terms')
     })

     app.get('/payment',(req,resp)=>{
        return resp.render('payment')
     })
}

module.exports = initRoutes;