var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const paypal = require('paypal-node-sdk');
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { subscribe } = require("../routes/users");



paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});



const serviceSID = process.env.TWILIO_SERVICESID;
const accountSID = process.env.TWILIO_ACCOUNTSID;
const token = process.env.TWILIO_TOKEN;
const client = require("twilio")(accountSID, token);

/* GET home page. */
var loginErrMessage = "";
var logged;
let Mob;
let cartMessage;
let countCart;


let successMessage = "";

/* <--------------------------------------------------------------User open the site--------------------------------------------------> */


let userHome = async function (req, res, next) {
    if (req.session.loggedIn) {
      userHelpers.getCartCount(req.session.user._id).then(async (cartCount) => {
        
  
        let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
        let banner=await adminHelpers.getBanners()
        let brand=await userHelpers. getCategoryBrands()
        let recentlyViewed = await userHelpers.getRecentlyViewedProducts(req.session.user._id)
  
        adminHelpers.getallProducts().then((products) => {
          res.render("user/home", {userHeader: true,logged,products,cartCount,wishlistCount,banner,brand,recentlyViewed});
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
    } else {
      let banner=await adminHelpers.getBanners()
      let brand=await userHelpers. getCategoryBrands()
      adminHelpers.getallProducts().then((products) => {
        res.render("user/home", { userHeader: true, products,banner,brand });
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })    })
    }
  }


  let home = (req, res) => {
    res.redirect("/");
  }


  /* <---------------------------------------------------------User Login---------------------------------------------------------------> */



  let userLogin = (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/login", { userHeader: true, loginErrMessage ,noFooter:true});
      loginErrMessage = "";
    }
  }

  /* <---------------------------------------------------------User Login post method---------------------------------------------------------------> */


  let userLoginPost = (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      
        req.session.loggedIn = true;
        req.session.user = response.userdata;
        user = req.session.user;
        logged = response.userdata;
        res.redirect("/");
  
      }).catch((response)=>{
        loginErrMessage = response.errMessage;
        res.redirect("/login");
      })
  
  }


  /* <---------------------------------------------User view category Product--------------------------------------------------------> */


  let categoryProductView = (req,res)=>{

    const {id}=req.params
    if(ObjectId.isValid(id)){
        if(req.session.loggedIn){
  
            userHelpers.getCategoryProducts(id).then(async(brand)=>{
              let cartCount = await userHelpers.getCartCount(req.session.user._id)
              let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
              res.render('user/category-products-view',{userHeader:true,logged,brand,cartCount,wishlistCount})
            })}
            else{
              userHelpers.getCategoryProducts(id).then((brand)=>{
                res.render('user/category-products-view',{userHeader:true,brand})
              })
            }
    }else{
        res.redirect('/*')
    }  
  }



  /* <--------------------------------------------------User OTP mobile number typing page-----------------------------------------------> */



  let otpLoginNumberInput =  (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/getotp", { loginErrMessage, userHeader: true });
      loginErrMessage = "";
    }
  }


  /* <------------------------------------User mobile number checking post method to otp typing--------------------------------------> */


  let otpMobileNumberCheck = (req, res) => {
    req.session.Mobile = req.body.number;
   const Mob = req.session.Mobile
  
    userHelpers.getOTP(req.body).then((response) => {
     
        client.verify
          .services(serviceSID)
          .verifications.create({ to: `+91${Mob}`, channel: "sms" })
          .then(() => {
            req.session.user = response.user;
            user = req.session.user;
            console.log("number verified")
            res.redirect("/otplogin/?number="+Mob);
          }).catch((error)=>{
            res.status(500).render('user/error',{ message: error.message })
          })
      }).catch((response)=>{
        loginErrMessage = response.err;
        res.redirect("/getotp");
      })
  }


  let otpGetCheck = (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/otp", { userHeader: true ,noFooter:true});
    }
  }


  /* <-----------------------------------------------------User OTP typing page-------------------------------------------------------> */


  let otpEnterPage = (req, res) => {
   
    let {number} = req.query
    console.log(number)
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/otp", { loginErrMessage, userHeader: true ,number,noFooter:true});
      loginErrMessage = "";
    }
  }


  /* <-----------------------------------------------------User OTP checking---------------------------------------------------------> */


  let otpCheck = (req, res) => {
    const { otp } = req.body;
    const Mob = req.session.Mobile;
  
    client.verify
      .services(serviceSID)
      .verificationChecks.create({ to: `+91${Mob}`, code: otp })
      .then((response) => {
        if (response.valid) {
          req.session.loggedIn = true;
          logged = true;
  
          res.redirect("/");
        } else {
          loginErrMessage = "Invalid Otp";
          res.redirect("/otplogin");
        }
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
  }


  /* <-----------------------------------------------------User resend OTP---------------------------------------------------------> */


  let resendotp = (req, res) => {
    const {number}= req.query
    console.log(number,"resend")
    if (number) {
      client.verify
        .services(serviceSID)
        .verifications.create({ to: `+91${number}`, channel: "sms" })
        .then(() => {
          res.redirect("/otp");
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
    }
  }


/* <--------------------------------------------------------User Signup page----------------------------------------------------------> */


  let userSignup = (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("user/signup", {
        userHeader: true,
        loginErr: req.session.loginErr,noFooter:true
      });
      req.session.loginErr = false;
    }
  }


  /* <--------------------------------------------------------User Signup post method----------------------------------------------------------> */


  let signupPostMethod = (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      if (response) {
        req.session.loginErr = "User Already exist";
        res.redirect("/signup");
      } else {
        userHelpers.AddStatus(req.body).then(() => {
          // req.session.loggedIn=true
          // logged=true
          res.redirect("/login");
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
      }
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
    })
  }


  /* <--------------------------------------------------------User view products----------------------------------------------------------> */



  let viewProducts = async(req, res) => {
  
    let products =res.paginatedResults.products
    let next =res.paginatedResults.next
    let previous=res.paginatedResults.previous
    let pages =res.paginatedResults.pages
    let pageCount =res.paginatedResults.pageCount
    let currentPage =res.paginatedResults.currentPage
    
  
    if (req.session.loggedIn) {
     
         let categories = await adminHelpers.getCategory()
         let wishlistProducts = await userHelpers.wishlistProducts(req.session.user._id)
         
        user = req.session.user
        
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
        let cartData = await userHelpers.getCartProductList(req.session.user._id)
       
          res.render("user/products", {userHeader: true,logged,cartCount,wishlistProducts,products,user,categories,next,previous,cartData,pages,pageCount,currentPage,wishlistCount});
      
     
    } else {
      
        let categories = await adminHelpers.getCategory()
          
          res.render("user/products", { userHeader: true, products,categories,next,previous,pages,pageCount,currentPage });
      
      
    }
  }


  /* <--------------------------------------------------------User product details----------------------------------------------------------> */


  let productView =  (req, res) => {
    const {id} = req.params
    if(ObjectId.isValid(id)){
        if (req.session.loggedIn) {
        userHelpers.ProductView(id).then(async(view) => {
          let cartCount = await userHelpers.getCartCount(req.session.user._id)
          let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
            res.render("user/product-view", {
            userHeader: true,
            logged,
            view,
            cartCount,
            wishlistCount
            });
        });
        } else {
        userHelpers.ProductView(id).then((view) => {
            res.render("user/product-view", { userHeader: true, view });
        });
        }
    }else{
        res.redirect('/*')
    }
  }


  /* <--------------------------------------------------------User add to cart--------------------------------------------------------> */



  let addToCart =  (req, res) => {
    if (req.session.loggedIn) {
      const { id } = req.params;
  
      userHelpers.addToCart(id, req.session.user._id).then(() => {
        res.redirect("/cart");
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
    } else {
      res.redirect("/login");
    }
  }


/* <--------------------------------------------------------User view cart----------------------------------------------------------> */


  let viewCart = async (req, res) => {
    if (req.session.loggedIn) {
      userHelpers.getCartProducts(req.session.user._id).then((cartItems) => {
        if (cartItems.noItem) {
          cartMessage = cartItems.NoCartMessage;
          res.render("user/cart", { userHeader: true, logged, cartMessage });
        } else {

          userHelpers.getGrandTotal(req.session.user._id).then(async(totalPrice) => {
            let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);

            let total = totalPrice[0]

            if(total){
              var couponPrice = await userHelpers.getCouponPrice(req.session.user._id,total)
              
           var totalAfterCoupon = couponPrice[0]
         
  
            }
           
            
            res.render("user/cart", {userHeader: true,logged,cartItems,user,total,totalAfterCoupon,wishlistCount});
          }).catch((error)=>{
            res.status(500).render('user/error',{ message: error.message })
          });
        }
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
    } else {
      res.redirect("/login");
    }
  }


  /* <--------------------------------------------------------change Product quantity in cart----------------------------------------------------------> */

  let changeQuantity = (req, res) => {

    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getGrandTotal(req.body.user);
  
      
     console.log(response.total[0])
     response.couponOffer= await userHelpers.getCouponPrice(req.session.user._id,response.total[0])
     
     
      res.json(response);
    }).catch((response)=>{
      res.json(response)
    })
  }


  /* <--------------------------------------------------------User delete cart----------------------------------------------------------> */

  let deleteCart =  (req, res) => {
    userHelpers.removeProduct(req.body).then((response) => {
      res.json(response);
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
    })
  }


  /* <--------------------------------------------------------User checkout----------------------------------------------------------> */

  let checkout = async (req, res) => {
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
    if(cartCount){
     let address = await userHelpers.getUserOrderAddress(req.session.user._id);
   
  
      userHelpers.getCartProducts(req.session.user._id).then((cartItems) => {
        userHelpers.getGrandTotal(req.session.user._id).then(async(total) => {
          
            let totalAmount = total[0].totalAmount;
          let couponDiscount= await userHelpers.getCouponPrice(req.session.user._id,total[0])
          let couponOffer=couponDiscount[0]
        
            res.render('user/checkout',{userHeader:true,logged,cartItems,user,totalAmount,address,couponOffer,cartCount,wishlistCount})
         
         
          
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
    }else{
      res.redirect('/products')
    }
  }


  /* <--------------------------------------------------------select address in checkout----------------------------------------------------------> */

  let addressInCheckout = (req,res)=>{
  
    userHelpers.addExistingAddress(req.body,req.session.user._id).then((response)=>{
      
      res.json(response)
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
    })
  }


  /* <--------------------------------------------------------User place order----------------------------------------------------------> */

  let placeOrder = (req, res) => {
    userHelpers.getCartProductList(req.body.userId).then(async(  products)=>{
     let totalAmount= await userHelpers.getGrandTotal(req.body.userId)
     let totalamount = totalAmount[0].totalAmount;
    let coupon= await userHelpers.getCouponPrice(req.session.user._id,totalAmount[0])
    let couponApply=coupon[0]
     userHelpers.placeOrder(req.body, products,totalamount,couponApply).then(async(objorder) => {
      let prodData=objorder.productData 
      let insertId = objorder.insertId
      if(prodData){    
        prodData.forEach(element => {     
          userHelpers.decrementStock(element)
        }); 
      }   
      if(req.body.paymentmethod==="COD"){     
        res.json({codSuccess: true ,insertId});
      }
      else if(req.body.paymentmethod==="wallet"){
        userHelpers.checkWalletAmount(totalamount,req.session.user._id).then(()=>{
          res.json({walletSuccess: true ,insertId});
        }).catch(()=>{
          res.json({walletSuccess:false})
        })    
      }   
      else if(req.body.paymentmethod=="Online"){    
        userHelpers.useRazorpay(objorder.insertId,totalamount,couponApply).then((response)=>{
            res.json({response,razorpay:true,insertId})
        })
      }
      else{
        
        
        res.json({paypal:true,insertId})
      }
     
  }).catch((error)=>{
    res.status(500).render('user/error',{ message: error.message })
  })
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
    })
   
  }


  /* <--------------------------------------------------------user paypal----------------------------------------------------------> */

  let usePaypal = (req, res) => {
    orderId=req.body.orderId
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success/?orderId="+orderId,
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          // "item_list": {
          //     "items": [{
          //         "name": "Red Sox Hat",
          //         "sku": "001",
          //         "price": "25.00",
          //         "currency": "USD",
          //         "quantity": 1
          //     }]
          // },
          "amount": {
              "currency": "USD",
              "total": "25.00"
          },
          // "description": "Hat for the best team ever"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.json(payment.links[i].href);
          }
        }
    } 
  });
  
  }


  /* <--------------------------------------------------------paypal success----------------------------------------------------------> */

  let paypalSuccess = (req, res) => {
   let ordId=req.query.orderId
    
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));

          userHelpers.afterPaymentSuccess(ordId,req.session.user._id).then((prodData)=>{
              userHelpers. changePaymentStatus(ordId).then(()=>{
                prodData.forEach(element => {
       
                  userHelpers.decrementStock(element)
                  userHelpers.changeStatusPendingToPlaced(element)
                }); 
              
                 res.redirect('/order-success/?orderId='+ordId) 
              }).catch((error)=>{
                res.status(500).render('user/error',{ message: error.message })
              })
          }).catch((error)=>{
            res.status(500).render('user/error',{ message: error.message })
          })
         
      }
  });
  }


/* <-------------------------------------------------------verify razorpay----------------------------------------------------------> */

  let verifyRazorpay = (req,res)=>{
    console.log(req.body)
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
        console.log("payment successfull")
        res.json({status:true})
      }).catch((error)=>{
        res.status(500).render('user/error',{ message: error.message })
      })
    }).catch((err)=>{
      
      res.json({status:"payment Failed"})
    })
  }


  /* <--------------------------------------------------------check wallet for order----------------------------------------------------------> */

  let checkWallet = async(req,res)=>{
    let totalAmount= await userHelpers.getGrandTotal(req.session.user._id)
    let totalamount = totalAmount[0].totalAmount;
    
     userHelpers.walletCheck(req.session.user._id,totalamount).then(()=>{
      res.json({walletExist:true})
     }).catch(()=>{
      res.json({walletExist:false})
     })
  }


  /* <--------------------------------------------------------order success page----------------------------------------------------------> */

  let orderSuccessPage =  (req, res) => {
    let orderId=req.query.orderId
    userHelpers.getOrderSummary(orderId).then((summary)=>{
      userHelpers.getGrandTotalForSummary(orderId).then((total)=>{
        res.render("user/placeOrder", { userHeader: true, logged, summary ,total });
      })
      
    })
    
  }


/* <----------------------------------------------------------------------after razorpay--------------------------------------------> */

  let afterRazorpay = (req,res)=>{
    userHelpers.afterPaymentSuccess(req.body['order[receipt]'],req.session.user._id).then((prodData)=>{
  
      prodData.forEach(element => {
         
        userHelpers.decrementStock(element)
        userHelpers.changeStatusPendingToPlaced(element)
      }); 
      res.json(prodData)
  
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
  
    })
    
   
  }


/* <--------------------------------------------------------view orders----------------------------------------------------------> */

  let viewOrders = (req,res)=>{
    
   userHelpers.getFullOrders(req.session.user._id).then(async(orders)=>{
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
    res.render('user/orders',{userHeader:true,orders,logged,cartCount,wishlistCount})
   }).catch((error)=>{
    res.status(500).render('user/error',{ message: error.message })
  
   })
  }


  /* <--------------------------------------------------------view order details----------------------------------------------------------> */

  let orderFullDetails =async(req,res)=>{
    const {id} = req.query
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
    userHelpers.getOrders(id).then((orders) => {
     
      orders.forEach(element=>{
        
        if(element.status==="cancelled"){
         element.cancelled=true 
          
        }else if(element.status==="Delivered"){
            element.Delivered=true
        }else if(element.status=="Return-requested" || element.status==="Return Approved"){
          element.returnOrder=true
        }else if(element.status=="Refund Approved"){
          element.refunded = true
        }else{
         element.cancelled=false
         element.Delivered=false
         element.returnOrder=false
  
        }
      })
      
      res.render("user/myorders", { userHeader: true, logged, orders ,cartCount,wishlistCount});
    }).catch((error)=>{
      res.status(500).render('user/error',{ message: error.message })
    })
  }


  /* <--------------------------------------------------------cancel order----------------------------------------------------------> */

  let cancelOrder = (req,res)=>{
    console.log(req.body)
    adminHelpers.updateOrderStatus(req.body).then((response)=>{
    
        userHelpers.stockIncrement(req.body).then((done)=>{
          res.json({done:true})
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
  
        })
        
      })
    }


/* <--------------------------------------------------------rerurn order----------------------------------------------------------> */



    let returnOrder = (req,res)=>{
        
        userHelpers.returnOrder(req.body).then(()=>{
            let ordId = ObjectId(req.body.orderId)
          
         adminHelpers. updateOrderStatus(req.body).then(()=>{
         
           res.redirect('/order-product-details/?id='+ordId)
         })
         
        }).catch(()=>{
            let error = {}
            error.message ="something went wrong"
            console.log("catch worked")
         res.status(500).render('user/error',{ message: error.message })
       
        })
        
    }


    /* <--------------------------------------------------------add to wishlist----------------------------------------------------------> */
  
    let addTowishlist = (req, res) => {
        if (req.session.loggedIn) {
          const { product } = req.body;
          console.log(product,"ssssssss")
          userHelpers.addToWishlist(product, req.session.user._id).then(() => {
            res.json({ login: true });
          }).catch((error)=>{
            res.status(500).render('user/error',{ message: error.message })
          })
        } else {
          res.json({ login: false });
        }
    }


/* <--------------------------------------------------------view wishlist----------------------------------------------------------> */

  let viewWishlist = (req, res) => {
  
        userHelpers.getWishlistProducts(req.session.user._id).then(async(products) => {
      
          let cartCount = await userHelpers.getCartCount(req.session.user._id)
         
            res.render("user/wishlist", { userHeader: true, products, logged ,cartCount});
      
        }).catch((message)=>{
         
          let wishlistMessage = message.NoWishlistMessage;
            
            res.render("user/wishlist", {
              userHeader: true,
              wishlistMessage,
              logged,
            });
        })
    }


/* <--------------------------------------------------------delete wishlist----------------------------------------------------------> */

    let deleteWishlistProduct = (req, res) => {
        userHelpers.removeWishlistProduct(req.body).then((response) => {
          res.json(response);
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
    }


/* <--------------------------------------------------------view dashboard----------------------------------------------------------> */

    let userDashboard = (req, res) => {
        userHelpers.getUserOrderAddress(req.session.user._id).then(async(address)=>{
          let cartCount = await userHelpers.getCartCount(req.session.user._id)
          let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
          user = req.session.user
          res.render("user/dashboard", {userHeader: true,logged,loginErrMessage,successMessage,address,user,cartCount,wishlistCount});
        loginErrMessage = "";
        successMessage = "";
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
        
      }


/* <--------------------------------------------------------change password----------------------------------------------------------> */

    let changePassword = async(req, res) => {
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
        res.render("user/change-password", {
          userHeader: true,
          logged,
          loginErrMessage,
          successMessage,
          cartCount,
          wishlistCount
        });
        loginErrMessage = "";
        successMessage = "";
      }  


/* <--------------------------------------------------------submit change password----------------------------------------------------------> */

   let submitChangePassword =  (req, res) => {
        userHelpers.changePassword(req.body, req.session.user._id).then((response) => {
         
            successMessage = response.successMessage;
            res.redirect("/changepassword");
          }).catch((response)=>{
            loginErrMessage = response.errmessage;
            res.redirect("/changepassword");
          })  
            
          
       
    }


/* <--------------------------------------------------------edit user data----------------------------------------------------------> */

    let editUserData = async(req, res) => {
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);

        userHelpers.getUserDatatoEdit(req.session.user._id).then((userData) => {
          res.render("user/edit-profile", { userHeader: true, logged, userData,loginErrMessage,successMessage,cartCount,wishlistCount});
          successMessage = "";
          loginErrMessage = "";
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
    }


/* <-------------------------------------------------------submit user data----------------------------------------------------------> */

    let submitEditUserData = (req, res) => {
        userHelpers.editUserData(req.body, req.session.user._id).then((response) => {
      
          successMessage = response.successMessage;
            res.redirect("/userEdit");
      
          }).catch((response)=>{
            loginErrMessage = response.errMessage;
            res.redirect("/userEdit")
          })  
    }





    let deleteAddress = (req,res)=>{
        userHelpers.deleteAddress(req.body,req.session.user._id).then((response)=>{
         res.json(response)
        }).catch((error)=>{
         res.status(500).render('user/error',{ message: error.message })
        })
    }

    
    let viewWallet = (req,res)=>{
        userHelpers.getWalletDetails(req.session.user._id).then(async(RefundData)=>{
      
          let cartCount = await userHelpers.getCartCount(req.session.user._id)
          let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);
         let userData = req.session.user
            res.render('user/wallet',{userHeader: true, logged,RefundData,userData,cartCount,wishlistCount})
      
          
        })
    }


    let applyCoupon = async(req,res)=>{
  
        let totalPrice= await userHelpers.getGrandTotal(req.session.user._id)
         let total=totalPrice[0].totalAmount
        userHelpers.applyCoupon(req.body,total,req.session.user._id).then((response)=>{
          
        res.json(response)
          
        }).catch((response)=>{
          res.json(response)
        })
      }


    let deleteCoupon = (req,res)=>{
        let {couponId} = req.body
      
        userHelpers.deleteCoupon(couponId,req.session.user._id).then(()=>{
          res.json({delete:true})
        }).catch((error)=>{
          res.status(500).render('user/error',{ message: error.message })
        })
      }


   let searchProducts = async(req,res)=>{
        let searchProducts = req.body.searchItems.trim();
       let searchItems = await userHelpers.getSearchProducts(searchProducts)
       res.send({search:searchItems})
    }


    let filterProducts = async(req,res)=>{

        if (req.session.loggedIn) {
          try{
            let filterProducts = await userHelpers.getFilterProducts(req.body)
            let categories = await adminHelpers.getCategory()
            let wishlistProducts = await userHelpers.wishlistProducts(req.session.user._id)
            
           user = req.session.user
      
           let cartCount = await userHelpers.getCartCount(req.session.user._id)
           let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id);

           let cartData = await userHelpers.getCartProductList(req.session.user._id)
          
             res.render("user/filterProducts", {userHeader: true,wishlistCount,cartCount,filterProducts,logged,wishlistProducts,user,countCart,categories,cartData,});
      
          }catch(error){
            res.status(500).render('user/error',{ message: error.message })
          }
       
        } else {
          
            let categories = await adminHelpers.getCategory()
            let filterProducts = await userHelpers.getFilterProducts(req.body)
              res.render("user/filterProducts", { userHeader: true, filterProducts,categories});
          
          
        }
    }


    let recentlyViewed = (req,res)=>{

        if(req.session.user){
          let {prodId} = req.body
        
        
        userHelpers.addToRecentlyViewed(prodId,req.session.user._id).then(()=>{
          res.json()
        })
        }
      
         
      }


    let userLogout = (req, res) => {
  
        req.session.loggedIn = "";
        res.redirect("/");
      }
    
    


  module.exports = {
    userHome,
    home,
    userLogin,
    userLoginPost,
    categoryProductView,
    otpLoginNumberInput,
    otpMobileNumberCheck,
    otpEnterPage,
    otpCheck,
    otpGetCheck,
    resendotp,
    userSignup,
    signupPostMethod,
    viewProducts,
    productView,
    addToCart,
    viewCart,
    changeQuantity,
    deleteCart,
    checkout,
    addressInCheckout,
    placeOrder,
    usePaypal,
    paypalSuccess,
    verifyRazorpay,
    checkWallet,
    orderSuccessPage,
    afterRazorpay,
    viewOrders,
    orderFullDetails,
    cancelOrder,
    returnOrder,
    addTowishlist,
    viewWishlist,
    deleteWishlistProduct,
    userDashboard,
    changePassword,
    submitChangePassword,
    editUserData,
    submitEditUserData,
    deleteAddress,
    viewWallet,
    applyCoupon,
    deleteCoupon,
    searchProducts,
    filterProducts,
    recentlyViewed,
    userLogout
  }