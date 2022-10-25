var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload }=require('../public/javascripts/fileUpload')
const adminController = require('../controllers/adminController')
const middleWare = require('../controllers/middlewares')



/* <---------------------------------------------------------------login Page---------------------------------------------------------> */

router.get('/', adminController.adminLogin);



/* <---------------------------------------------------------------admin logged in----------------------------------------------------> */

router.post('/login',adminController.loginPost)



/* <---------------------------------------------------------------dashboard---------------------------------------------------------> */

router.get('/dashboard',adminController.adminDashboard)


/* <---------------------------------------------------------------view user---------------------------------------------------------> */

router.get('/viewUser',adminController.viewUser)



/* <-------------------------------------------------------------block user----------------------------------------------------------> */

router.get('/block/:id',adminController.blockUser)



/* <---------------------------------------------------------------unblock user-------------------------------------------------------> */

router.get('/unblock/:id',adminController.unblockUser)



/* <---------------------------------------------------------------view products------------------------------------------------------> */

router.get('/viewproducts',middleWare.adminLoginCheck,adminController.viewProducts)



/* <---------------------------------------------------------------add products------------------------------------------------------> */

router.get('/addproduct',middleWare.adminLoginCheck,adminController.addProducts)



/* <------------------------------------------------------add product post method----------------------------------------------------> */
  
router.post('/productview',upload.array('image'),adminController.addProductPostMethod)



/* <-----------------------------------------------------------block product---------------------------------------------------------> */

router.get('/blockProduct/:id',adminController.blockProduct)



/* <---------------------------------------------------------------unblock product---------------------------------------------------> */

router.get('/unblockProduct/:id',adminController.unblockProducts)



/* <---------------------------------------------------------------edit product---------------------------------------------------------> */

  router.get('/editProduct/:id',adminController.getEditProduct)


/* <------------------------------------------------------edit product post method---------------------------------------------------> */

  router.post('/editsubmit/:id',upload.array('image'),adminController.editProductSubmit)

  

/* <---------------------------------------------------------------view orders---------------------------------------------------------> */

  router.get('/view-orders',middleWare.adminLoginCheck,adminController.viewOrders)



/* <--------------------------------------------------------------view order details------------------------------------------------> */

  router.get('/product-view-order/:id',middleWare.adminLoginCheck,adminController.orderDetails)



/* <---------------------------------------------------------------returned orders---------------------------------------------------> */

  router.get('/returned-orders',middleWare.adminLoginCheck,adminController.returnedOrders)



/* <---------------------------------------------------------------submit return---------------------------------------------------------> */

  router.post('/submit-return-status',adminController.submitReturnStatus)



/* <-----------------------------------------------------approve refund after return-------------------------------------------------> */

  router.post('/approve-refund',adminController.approveRefund)



/* <--------------------------------------------------approve refund after cancel----------------------------------------------------> */

  router.post('/approve-refund-after-cancel',adminController.approveRefundAfterCancel)



/* <---------------------------------------------------------------view category---------------------------------------------------------> */

    router.get('/manageCategory',middleWare.adminLoginCheck,adminController.viewCategory)



/* <---------------------------------------------------------------add category---------------------------------------------------------> */

   router.get('/addcategory',middleWare.adminLoginCheck,adminController.categoryadd)


   router.get('/categoryadd',middleWare.adminLoginCheck,adminController.addCategory)




/* <------------------------------------------------------add category post method---------------------------------------------------> */

   router.post('/submitcategory',upload.any('image'),adminController.addCategoryPostMethod)



/* <------------------------------------------------------edit category-------------------------------------------------------------> */

  router.get('/edit-brand/:id',middleWare.adminLoginCheck,adminController.getBrandToEdit)



/* <------------------------------------------------------edit category post method---------------------------------------------------> */

  router.post('/update-brand/:id',upload.any('image'), adminController.editBrandPostMethod)



/* <------------------------------------------------------delete category-------------------------------------------------------------> */

  router.post('/delete-brand',adminController.deleteBrand)



/* <------------------------------------------------------view banners-----------------------------------------------------------------> */

   router.get('/manage-banners',middleWare.adminLoginCheck,adminController.viewBanners)



 
/* <------------------------------------------------------add banners-----------------------------------------------------------------> */

   router.get('/add-banners',middleWare.adminLoginCheck,adminController.addBanner)



/* <------------------------------------------------------add banner post method------------------------------------------------------> */

router.post('/banner-add',upload.any('image'),adminController.addBannerPostMethod)



/* <----------------------------------------------------------------edit banner-------------------------------------------------------> */

router.get('/editbanner/:id',middleWare.adminLoginCheck,adminController.getBannerToEdit)



/* <------------------------------------------------------edit banner post method---------------------------------------------------> */

router.post('/banner-edit-submit/:id',upload.any('image'),adminController.editBannerPostMethod)



router.post('/delete-banner',adminController.deleteBanner)
 



/* <------------------------------------------------------change order status-------------------------------------------------------> */

  router.post('/orderStatus',adminController.updateOrderStatus)



 /* <-----------------------------------------------------------view coupons---------------------------------------------------------> */

  router.get('/view-coupons',middleWare.adminLoginCheck,adminController.viewCoupons)



  /* <-------------------------------------------------------------add coupon--------------------------------------------------------> */

  router.post('/add-coupon',adminController.addCoupon)


  router.post('/delete-coupon',adminController.deleteCoupon)



/* <----------------------------------------------------------view offers------------------------------------------------------------> */

  router.get('/view-offers',middleWare.adminLoginCheck,adminController.viewOffers)



/* <----------------------------------------------------------------add Offer-------------------------------------------------------> */

  router.post('/add-offers',adminController.addOffer)



/* <-------------------------------------------------------------delete Offer--------------------------------------------------------> */

  router.post('/delete-offer',adminController.deleteOffer)



  /* <---------------------------------------------------------------sales report-----------------------------------------------------> */

  router.get('/sale-reports', middleWare.adminLoginCheck,adminController.salesReport)


 

/* <---------------------------------------------------------------Logout-------------------------------------------------------------> */

router.get('/logout',adminController.adminLogout)



/* <----------------------------------------------------------!!!!!!!END!!!!!!!-------------------------------------------------------> */


module.exports = router;
