const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const fileUpload = require('express-fileupload')
const session = require('express-session');
const MongoDbStore = require("connect-mongo");
const cloudinary = require("cloudinary").v2;
const flash = require("express-flash");
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');


const PORT = process.env.PORT || 9000
const app = express();

app.use(express.json())
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: false
}))

const razorpay = new Razorpay({
    key_id: 'rzp_test_99Kx2xlSYCl4cU',
    key_secret: 'L3yiJRYsLb9RbuUBMZ2BEcpi'
})

mongoose.connect('mongodb+srv://pradeep:pradeep@cluster0.i7i2rti.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const Product = require('./backend/models/products');
const Register = require("./backend/models/register");
const Order = require('./backend/models/order');


app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);

app.use(flash())
app.use(fileUpload({
    useTempFiles: true
}))


//Setting Sessions
app.use(session({
    secret: '1234567qwdeq890QWERTY',
    resave: false,
    store: MongoDbStore.create({ mongoUrl: 'mongodb+srv://pradeep:pradeep@cluster0.i7i2rti.mongodb.net/?retryWrites=true&w=majority' }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }

}))

app.use((req, res, next) => {
    res.locals.session = req.session
    let h = res.locals.session
    let q = req.session.user
    next()
})

app.use("/static", express.static('./static/'));

//Setting Cloudinary
cloudinary.config({
    cloud_name: 'dihumtgjw',
    api_key: '419823895856789',
    api_secret: 'cGbA8wVSkoQrtTvhZfRIWy7K__8',
    secure: true
});

//Sign Up User
app.post("/sign_up", async (req, resp) => {
    var username = req.body.username
    var name = req.body.name
    var email = req.body.email
    var phno = req.body.phno
    var password = req.body.password
    var confirmPassword = req.body.confirmPassword

    Register.exists({ email: email }, (err, result) => {
        if (result) {
            req.flash('error', "Email Already Taken")
            return resp.render('registration')
        }
    })

    if (password === confirmPassword) {

        const registerUser = new Register({
            username: username,
            name: name,
            email: email,
            phno: phno,
            password: password,
        })

        await registerUser.save().then((user) => {
            return resp.redirect('/')
        }).catch(err => {
            req.flash('error', 'Something went wrong')
            return resp.render('registration')
        })
    } else {
        req.flash('error', 'Password Do Not Match')
        resp.redirect('/signup')

    }
})

//login Form for user
app.post("/login", async (req, resp) => {
    var email = req.body.email
    var password = req.body.password

    const user = await Register.findOne({ email: email })
    if (user != null) {
        if (password === user.password) {
            if (req.session.user == null) {
                req.session.user = user
                if (req.session.user.role === 'admin') {
                    resp.redirect('/admin')
                } else {
                    resp.redirect('/')
                }
            }

        }
        else {
            req.flash('error', 'password Wrong')
            console.log("User Not Found")
            resp.redirect('/login')

        }
    } else {
        req.flash('error', 'Email Not Found')
        resp.redirect('/login')
    }
})

//Add Product -- Admin Only
app.post('/admin/product', async (req, resp) => {
    const file = req.files.BackgroundImage
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        const fileTwo = req.files.FrontImage
        cloudinary.uploader.upload(fileTwo.tempFilePath, async (err, res) => {
            var ProductName = req.body.ProductName
            var ProductHeading = req.body.ProductHeading
            var Price = req.body.Price
            var BackgroundImage = result.url
            var FrontImage = res.url
            var ProductDescription = req.body.ProductDescription
            var Material = req.body.Material
            var Color = req.body.Color
            var Dimension = req.body.Dimension
            var Type = req.body.Type

            const newProduct = new Product({
                ProductName: ProductName,
                ProductHeading: ProductHeading,
                Price: Price,
                BackgroundImage: BackgroundImage,
                FrontImage: FrontImage,
                ProductDescription: ProductDescription,
                Material: Material,
                Color: Color,
                Dimension: Dimension,
                Type: Type
            })

            await newProduct.save().then((product) => {
                resp.redirect('/')
            }).catch(err => {
                console.log(err)
                resp.redirect('/')
            })

        })

    })
})

//Update Cart
app.post('/update-cart', (req, resp) => {

    if (!req.session.cart) {
        req.session.cart = {
            items: {},
            totalQty: 0,
            totalPrice: 199
        }
    }
    let cart = req.session.cart

    // Check if item does not exist in cart 
    if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
            item: req.body,
            qty: 1
        }
        cart.totalQty = cart.totalQty + 1
        cart.totalPrice = cart.totalPrice + req.body.Price
    } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
        cart.totalQty = cart.totalQty + 1
        cart.totalPrice = cart.totalPrice + req.body.Price
    }
    return resp.json({ totalQty: req.session.cart.totalQty })

})

//Modify -cart
app.post('/modify-cart', (req, resp) => {


    // Check if item does not exist in cart 
    if (req.session.cart.items[req.body.item._id]) {
        const x = req.session.cart.items[req.body.item._id].qty
        const y = req.session.cart.items[req.body.item._id].item.Price
        const z = x * y

        req.session.cart.totalQty = req.session.cart.totalQty - req.session.cart.items[req.body.item._id].qty
        req.session.cart.totalPrice = req.session.cart.totalPrice - z
        delete req.session.cart.items[req.body.item._id]
        console.log({ totalQty: req.session.cart.totalQty })
        if (req.session.cart.totalQty == 0) {
            delete req.session.cart
        }
        var redir = { redirect: "/" };
        return resp.json(redir);

    }
})

//Checkout Details
app.post("/checkout", (req, resp) => {
    var phone = req.body.phone
    var address = req.body.address
    if (!req.session.billing) {
        req.session.billing = {
            address: '',
            phone: '',
        }
    }
    var bill = req.session.billing
    bill.address = address
    bill.phone = phone

    resp.redirect('/payment')
})

//Admin Update order status
app.post('/admin/order/status', (req, resp) => {
    Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, data) => {
        if (err) {
            resp.redirect('/admin/order')
        } else {
            resp.redirect('/admin/order')
        }
    })
})

app.post('/admin/product/update/:id', async (req, resp) => {
    console.log(req.body)
    var ProductName = req.body.ProductName
    var Navigate = req.body.Navigate
    var ProductHeading = req.body.ProductHeading
    var Price = req.body.Price
    var ProductDescription = req.body.ProductDescription
    var ProductCode = req.body.ProductCode
    var Material = req.body.Material
    var Style = req.body.Style
    var Color = req.body.Color
    var Dimension = req.body.Dimension
    var WoodSpecies = req.body.WoodSpecies
    var ProductDetail = req.body.ProductDetail
    var Type = req.body.Type
    await Product.updateOne({ _id: req.params.id }, {
        ProductName: ProductName,
        Navigate: Navigate,
        ProductHeading: ProductHeading,
        Price: Price,
        ProductDescription: ProductDescription,
        ProductCode: ProductCode,
        Material: Material,
        Style: Style,
        Color: Color,
        Dimension: Dimension,
        WoodSpecies: WoodSpecies,
        ProductDetail: ProductDetail,
        Type: Type
    }).then(() => {
        resp.redirect('/admin')
    }).catch(err => {
        resp.render('notfound')
    })
})

//Payment

app.post('/paymen', (req, resp) => {


    let options = {
        amount: req.session.cart.totalPrice * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
    };

    razorpay.orders.create(options, (err, order) => {
        resp.json(order)
    })
})

app.post('/is-order-complete', async (req, resp) => {
    razorpay.payments.fetch(req.body.razorpay_payment_id).then(async (document) => {
        if (document.status === 'captured') {
            const order = new Order({
                customerId: req.session.user._id,
                item: req.session.cart.items,
                phone: req.session.billing.phone,
                address: req.session.billing.address
            })

            await order.save().then(result => {
                delete req.session.cart
                delete req.session.billing
                return resp.redirect('/')
            }).catch(err => {
                return resp.redirect('/cart')
            })
            resp.redirect('/')
        }
    })


})

require('./backend/routes/web')(app)

app.listen(PORT, () => {
    console.log("Server Running");
})