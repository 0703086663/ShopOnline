 
const User = require('../models/User')
const Brand = require('../models/Brand')
const Shoetype = require('../models/Shoetype')
const Shoe = require('../models/Shoe')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Order = require('../models/Order')

const { multipleMongooseToObject } = require('../ulti/mongoose')
const { mongooseToObject } = require('../ulti/mongoose')
const { checkUserExist } = require('../ulti/register')
const { makePassword } = require('../ulti/password');

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const stripe = require('stripe');


class SiteController {

    // [GET] /index -- Home page
    index(req, res, next){
        if(req.cookies.token){
            var token = req.cookies.token;
            var decodeToken = jwt.verify(token, 'secretpasstoken')
            Promise.all([
                User.findOne({_id: decodeToken}),
                Brand.find({}),
                Shoetype.find({}),
                Shoe.find({bestseller: true})
                    .populate('brand')
                    .populate('type')
                    .sort({createdAt: 1})
                    .limit(3),
                Shoe.find({available: true})
                .populate('brand')
                .populate('type')
                .sort({createdAt: 1})
                .limit(3)
            ])
            .then(([
                data,
                brandList,
                shoeType,
                shoeBestseller,
                shoeAvailable
            ]) => {
                if (data) {
                    req.data = data
                    return res.render('index',
                        {
                            user: mongooseToObject(data),
                            brandList: multipleMongooseToObject(brandList),
                            shoeType: multipleMongooseToObject(shoeType),
                            shoeBestseller: multipleMongooseToObject(shoeBestseller),
                            shoeAvailable: multipleMongooseToObject(shoeAvailable),
                            title: 'Home page'
                        })
                    next()
                }
            })
        }
        else {
            Promise.all([
                Brand.find({}),
                Shoetype.find({}),
                Shoe.find({bestseller: true})
                    .populate('brand')
                    .populate('type')
                    .sort({createdAt: 1})
                    .limit(3),
                Shoe.find({available: true})
                .populate('brand')
                .populate('type')
                .sort({createdAt: 1})
                .limit(3)
                
            ])
            .then(([
                brandList,
                shoeType,
                shoeBestseller,
                shoeAvailable
            ]) => {
                res.render('index', {
                    shoeBestseller: multipleMongooseToObject(shoeBestseller),
                    shoeAvailable: multipleMongooseToObject(shoeAvailable),
                    title: 'Home page'
                })
            }
            )
        }
    }

    // [GET] /logout --> Home page
    logout (req, res) {
        // req.logout();
        // delete req.session;
        // return res.render('login',{
        //     msgLog: 'You need to login first',
        //     layout: 'loginLayout',
        //     title: 'Login'
        // })
            res.clearCookie('token');
            return res.json({ logout: true , msgLog: 'Log out successfully'})
    }

    //[GET] /authonize User
    authonize(req, res, next){
        res.render('authonize', {
            title:'Authonize',
            layout: 'loginLayout'});
    }

    // //[GET] /validation User
    // validation(req, res, next){
    //     res.render('validation', {
    //         title:'Validation',
    //         layout: 'loginLayout'});
    // }

    //[GET] /register User
    register(req, res, next){
        if(!req.cookies.token){
            res.render('register', {
                title:'Register',
                layout: 'loginLayout'});
        }
        else{
            res.redirect('/user/profile')
        }
    }

    //[POST] /store User
    store(req,res,next) {
        User.findOne({
            $or: [
                {email: req.body.email}, 
                {phone: req.body.phone}
            ]
        }).then(data => {
            if(data != null){
                return res.render('register', {
                    title: 'Register',
                    layout: 'loginLayout',
                    msgReg: 'Email or phone is already registered',
                    success: false
                })
            }
            else{
                var temp = req.body.password
                bcrypt.hash(temp, 10, function(err, hash) {
                    const user = new User({
                        role: 'Customer',
                        password: hash,
                        email: req.body.email,
                        phone: req.body.phone,
                        name: req.body.name,
                        birthday: req.body.birthday,
                        address: req.body.address,
                        avatar: 'https://duytan.thinkingschool.vn/wp-content/uploads/2019/01/avatar.png'
                    })
                    // console.log(user)
                    user.save(err, result =>{
                        if(err) {
                            console.log('err: ' + err)
                            return res.render('register', {
                                title: 'Login',
                                layout: 'loginLayout',
                                msgReg: 'Failed to register',
                                success: false
                            })
                        }
                        return res.render('register', {
                            title: 'Login',
                            layout: 'loginLayout',
                            msgReg: 'Register Successfully',
                            success: true
                        })
                    })
                })
            }
        })
        .catch(err => console.log(err))

        
    }

    login(req, res, next){
        if(!req.cookies.token){
            res.render('login', {
                title:'Login',
                layout: 'loginLayout'});
        }
        else{
            res.redirect('/user/profile')
        }
    }

    //[POST] /validation User
    validation(req,res,next) {
        let username = req.body.username
        let password = req.body.password
        // console.log(username + ' ' + password)

        User.findOne({
            $or: [
                {email: username}, 
                {phone: username}
            ]
        }, (err, user) => {
            if (err) {
                return console.log(err)
            }
            if (!user) {
                // return res.render('login', {
                //     success: false,
                //     layout: 'loginLayout',
                //     msgLog: `Sai tài khoản hoặc mật khẩu`
                // })
                return res.render('login', {
                    success: false,
                    layout: 'loginLayout',
                    title: 'Login again',
                    msgLog: `Sai tài khoản hoặc mật khẩu`
                })
            }
            //kiểm tra nếu count = 10 thì là đang khoá tạm thời
            if (user.countFailed == 10) {
                return res.render('login', {
                    success: false,
                    layout: 'loginLayout',
                    title: 'Login again',
                    msgLog: `Tài khoản hiện đang bị tạm khóa, vui lòng thử lại sau 1 phút`
                })
            }
            //kiểm tra nếu count = 10 thì là đang khoá tạm thời
            if (user.countFailed == 6) {
                return res.render('login', {
                    success: false,
                    layout: 'loginLayout',
                    title: 'Login again',
                    msgLog: `Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản`
                })
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result) {
                    var token = jwt.sign({ _id: user._id }, 'secretpasstoken', {})
                    User.updateOne({ username: username }, { $set: { countFailed: 0 } }, (err, status) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    res.cookie('token',token, { maxAge: 2147483647, httpOnly: true });
                    // return res.render('index',{
                    //     msg: 'Login success',
                    //     title:'Home',
                    //     success: true,
                    //     user: mongooseToObject(user)
                    // })
                    return res.redirect('/')
                }
                const failed = user.countFailed
                console.log(failed)
                if (failed == 2) {
                    //Khoá tạm thời set count = 10
                    User.updateOne({ username: username }, { $set: { countFailed: 10 } }, (err, status) => {
                        if (err) {
                            console.log(err)
                        }
                    })

                    //Mở khoá tài khoản sau 1 phút, trả count về 3
                    var lockAccountOneMinute = setTimeout(function () {
                        User.updateOne({ username: username }, { $set: { countFailed: 3 } }, (err, status) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                        console.log(`unlock ${username} !`)
                    }, 60000);
                    return res.render('login', {
                        success: false,
                        title: 'Login again',
                        layout: 'loginLayout',
                        msgLog: `Tài khoản đã bị khoá trong 1 phút! Nếu bạn tiếp tục nhập sai thêm 3 lần nữa sẽ bị khoá vĩnh viễn!`
                    })
                } else if (failed >= 5) {
                    User.updateOne({ username: username }, { $set: { countFailed: 6 } }, (err, status) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    return res.render('login', {
                        success: false,
                        title: 'Login again',
                        layout: 'loginLayout',
                        msgLog: 'Tài khoản đã bị khoá vĩnh viễn! Bạn đã nhập sai mật khẩu quá nhiều lần! Liên hệ admin để mở lại tài khoản'
                    })
                } else {
                    User.updateOne({ username: username }, { $set: { countFailed: failed + 1 } }, (err, status) => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    return res.render('login', {
                        success: false,
                        title: 'Login again',
                        layout: 'loginLayout',
                        msgLog: `Bạn đã nhập sai mật khẩu ${failed + 1} lần!!!`
                    })
                }
            });
        })
    }

    // [GET] /:slug
    // Show 404 not found error
    error(req,res,next){
        if(req.cookies.token){
            var token = req.cookies.token;
            var decodeToken = jwt.verify(token, 'secretpasstoken')
            User.findOne({
                _id: decodeToken
            }).then(data => {
                if (data) {
                    req.data = data
                    // console.log(data)
                    return res.render('partials/error',
                        {
                            user: mongooseToObject(data),
                            title: 'Not Found',
                            layout: null
                        })
                }
            })
        }
        else{  
            res.render('partials/error', {
                title: 'Not Found',
                layout: null
            });
        }
    }

    // [GET] /cart
    cart(req,res,next){
        if(!req.cookies.token){
            if(!req.session.cart) {
                return res.render('cart', {
                    title: 'Cart'
                })
            }
            else{
                var cart = new Cart(req.session.cart)
                return res.render('cart',
                    {
                        shoe: cart.generateArrays(),
                        totalPrice: cart.totalPrice,
                        title: 'Cart',
                    })
            }
        }
        else {
            var token = req.cookies.token;
            var decodeToken = jwt.verify(token, 'secretpasstoken')
            if(req.session.cart){
                Promise.all([
                    User.findOne({_id: decodeToken}),
                    Shoe.find({})
                        .populate('brand')
                        .populate('type')
                ])
                .then(([
                    data,
                    shoe,
                ]) => {
                    if (data) {
                        req.data = data
                        var cart = new Cart(req.session.cart)
                        return res.render('cart',
                            {
                                user: mongooseToObject(data),
                                shoe: cart.generateArrays(),
                                totalPrice: cart.totalPrice,
                                title: 'Cart',
                            })
                    }
                })
            }
            else{
                User.findOne({_id: decodeToken})
                .then((user) => res.render('cart',{
                    user: mongooseToObject(user),
                    title: 'Cart'
                }))
            }
        }
    }


    //[POST] /checkout-by-wallet
    checkoutByWallet (req,res,next){
        if(!req.session.cart){
            return res.redirect('/cart');
        }
        else{
            var token = req.cookies.token;
            var decodeToken = jwt.verify(token, 'secretpasstoken')

            var money= parseInt(req.body.money)

            User.findOneAndUpdate({_id: decodeToken}, {$inc: {money: -money}})
            .then((data)=> {
                var order = new Order({
                    user: req.user,
                    cart: req.session.cart,
                    email: req.body.email,
                    address: req.body.address,
                    phone: req.body.phone,
                })
                order.save()
                req.session.cart = null;
                return res.render('cart',
                            {
                                user: mongooseToObject(data),
                                // shoe: cart.generateArrays(),
                                // totalPrice: cart.totalPrice,
                                title: 'Cart',
                                message: 'Checkout successfully'
                            })
            })
        }
    }

    //[POST] /checkout
    checkout (req,res,next){
        if(!req.session.cart){
            return res.redirect('/cart');
        }
        else{
            var cart = new Cart(req.session.cart);

            const stripe = require('stripe')('sk_test_51LCjUmGXzbc60gITm4NDsulfqX13P2Xy5TjTZzHyhVBjamQt1DMD6pIRvM7elIMFUFI0DUDuh18P5MyN0O18yyZ100setk5tNV');
            
            stripe.customers.create({
                email: req.body.email,
                source: req.body.stripeToken,
                name: req.body.name,
                address: {line1: req.body.address},

            })
            .then((customer) => {
                stripe.charges.create({
                amount: cart.totalPrice,
                currency: 'vnd',
                // source: req.body.stripeToken,
                description: 'Test Charge',
                customer: customer.id,
                }, function(err, charge){
                    if(err){
                        console.log(err);
                        res.redirect('back');
                    }
                    var order = new Order({
                        user: req.user,
                        cart: req.session.cart,
                        email: req.body.email,
                        address: req.body.address,
                        phone: req.body.phone,
                    })
                    order.save()
                    req.session.cart = null;
                    return res.redirect('/cart')
                })
            })
            .catch((err) => {
                res.render('partials/error',{
                    layout: null,
                    msg: 'Error: ' + err.message
                })
            })
        }
    }

    
    // [GET] /user/forgotps/
    forgotps(req,res,next){
        return res.render('forgotps',{
            title: 'Forgot Password',
            layout: 'loginLayout',
            msgFail: req.flash('failMessage'),
            msgSuccess: req.flash('successMessage')
        })
    }

    // [POST] /user/forgotps
    forgotpsRequest(req,res,next){
        let temp = makePassword();

        bcrypt.hash(temp, 10, function (err, hash) {
            User.findOneAndUpdate({email:req.body.email}, {$set:{password:hash}})
            .then((user)=>{
                if(!user){
                    req.flash('failMessage', 'Email not found')
                    res.redirect('back')
                }
                else{
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: "nguyentienthanh.tgdd@gmail.com",
                            pass: "fdpcycsrdcumuaar"
                        }
                    });

                    var mailOptions = {
                        from: { name: "DUSTIN-SHOP", address: process.env.GMAIL },
                        to: req.body.email,
                        title: 'Activation Account',
                        subject: 'DUSTIN STORE - Reset Password for Account',
                        text: `Information about this:
                            New password: ${temp}
                        `
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            req.flash('failMessage', 'Can not send email. Please try again')
                            console.log(error);
                        } else {
                            req.flash('successMessage', 'Mail sent successfully')
                            console.log('Email sent: ' + info.response);
                            res.redirect('back')
                        }
                    });
                }
            })
            .catch(err => console.log(err))
        });
    }
}

module.exports = new SiteController;

const res = require('express/lib/response');
const siteController = require('./SiteController');