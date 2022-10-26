var express = require("express");

var router = express.Router();
const userController = require('../controllers/userController')
const middleWare = require('../controllers/middlewares')
const userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const paypal = require('paypal-node-sdk');
const { response } = require("express");


/* <-------------------------------------------------------User open the site--------------------------------------------------------> */

router.get("/", userController.userHome);

/* <---------------------------------------------------------User Login---------------------------------------------------------------> */

router.get("/login", userController.userLogin);

/* <---------------------------------------------User Login check post mthod--------------------------------------------------------> */

router.post("/home", userController.userLoginPost);


/* <------------------------------------------------User product view of categories----------------------------------------------------> */



router.get('/product-view-category/:id',userController.categoryProductView)


/* <------------------------------------------------------User home Page--------------------------------------------------------------> */

router.get("/userhome", userController.home);

/* <--------------------------------------------------User OTP mobile number typing page-----------------------------------------------> */

router.get("/getotp",userController.otpLoginNumberInput);

/* <------------------------------------User mobile number checking post method to otp typing-----------------------------------------> */

router.post("/otp", userController.otpMobileNumberCheck );

router.get("/otp", userController.otpGetCheck);

/* <-----------------------------------------------------User OTP typing page---------------------------------------------------------> */

router.get("/otplogin", userController.otpEnterPage );

/* <-----------------------------------------------------User OTP checking post method----------------------------------------------> */

router.post("/otplogin", userController.otpCheck);

/* <-------------------------------------------------User resend otp page-------------------------------------------------------------> */

router.get("/resendotp", userController.resendotp);

/* <--------------------------------------------------------User Signup page----------------------------------------------------------> */

router.get("/signup", userController.userSignup);

/* <----------------------------------User Signup post method-------------------------------> */

router.post("/signup-user", userController.signupPostMethod);

/* <----------------------------------User Product page-------------------------------> */



router.get("/products", middleWare.paginatedResults ,userController.viewProducts);




/* <----------------------------------User Product View-------------------------------> */


router.get("/product-view/:id",userController.productView);



/* <----------------------------------User add to cart-------------------------------> */

router.get("/addToCart/:id",userController.addToCart);

/* <----------------------------------User Cart View-------------------------------> */

router.get("/cart", userController.viewCart);

/* <---------------------------------- Increment and decrement of quantity in the cart and grand total-------------------------------> */

router.post("/changeProductQuantity", userController.changeQuantity);


/* <----------------------------------User remove item from cart-------------------------------> */

router.post("/deleteProduct",userController.deleteCart);

/* <----------------------------------User order checkout-------------------------------> */

router.get("/checkout", middleWare.loginCheck, userController.checkout);




/* <----------------------------------get address for checkout-------------------------------> */



router.post('/getorderaddress',userController.addressInCheckout)



/* <----------------------------------User placeOrder-------------------------------> */


router.post("/place-order", userController.placeOrder);



/* <----------------------------------User paypal payment method-------------------------------> */


router.post('/pay',userController.usePaypal );



/* <----------------------------------Success route after Paypal-------------------------------> */


  router.get('/success', userController.paypalSuccess);




/* <----------------------------------User order verify razorpay-------------------------------> */



router.post('/verify-payment', userController.verifyRazorpay)

/* <----------------------------------Wallet checking for payment using wallet-------------------------------> */



router.post('/walletCheck',userController.checkWallet)


/* <----------------------------------User order success-------------------------------> */


router.get("/order-success", middleWare.loginCheck,userController.orderSuccessPage);






/* <----------------------------------User functions after successful payment-------------------------------> */



router.post('/order-after-online',userController.afterRazorpay)


/* <-------------------------------------------------------------------------=-----------User orders-------------------------------> */


router.get('/myorders',userController.viewOrders)



/* <---------------------------------------------User product view of orders------------------------------------------------------> */



router.get('/order-product-details',middleWare.loginCheck,userController.orderFullDetails)



/* <------------------------------------------------User cancel order---------------------------------------------------------------> */

router.post('/cancelorder',userController.cancelOrder)



  /* <---------------------------------------------User return order-----------------------------------------------------------------> */



  router.post('/return-order',userController.returnOrder)



/* <---------------------------------------------User add to wishlist----------------------------------------------------------------> */

router.post("/addToWishlist",userController.addTowishlist);



/* <-------------------------------------------User view wishlist--------------------------------------------------------------------> */

router.get("/view-wishlist", middleWare.loginCheck, userController.viewWishlist);



/* <----------------------------------------------User remove wishlist--------------------------------------------------------------> */


router.post("/delete-wishlist-product", userController.deleteWishlistProduct);



/* <------------------------------------------------User dashboard-------------------------------------------------------------------> */

router.get("/dashboard", middleWare.loginCheck, userController.userDashboard);


/* <---------------------------------------------User Change Password----------------------------------------------------------------> */


router.get("/changepassword",middleWare.loginCheck, userController.changePassword);

router.post("/change-password",userController.submitChangePassword);

/* <-----------------------------------------------------User edit Profile-----------------------------------------------------------> */

router.get("/userEdit",middleWare.loginCheck ,userController.editUserData);



/* <-----------------------------------------------------User post method after edit------------------------------------------------> */


router.post("/edit-profile", userController.submitEditUserData);



/* <-----------------------------------------------------User delete address------------------------------------------------> */




router.post('/addressDelete',userController.deleteAddress)


/* <-----------------------------------------------------User view wallet------------------------------------------------> */



router.get('/view-wallet',middleWare.loginCheck,userController.viewWallet)


/* <-----------------------------------------------------User enter coupon in the cart------------------------------------------------> */



router.post('/enter-coupon',userController.applyCoupon)


/* <-----------------------------------------------------User delete coupon------------------------------------------------> */



router.post('/delete-coupon',userController.deleteCoupon)


/* <-----------------------------------------------------User ajax post method for search products------------------------------------------------> */




router.post('/getSearchProducts',userController.searchProducts)


/* <-----------------------------------------------------User find filtered products ------------------------------------------------> */



router.post('/filter-find',userController.filterProducts)



/* <-----------------------------------------------------User recently viewed products in home page------------------------------------------------> */



router.post('/recently-viewed',userController.recentlyViewed)



/* <----------------------------------User Logout-------------------------------> */



router.get("/logout", userController.userLogout);



/* <-----------------------------------------------------Ends!!!!------------------------------------------------> */





module.exports = router;
