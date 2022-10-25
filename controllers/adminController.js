var express = require('express');
var router = express.Router();
var adminHelpers=require('../helpers/admin-helpers');
const userHelpers = require('../helpers/user-helpers');
const { upload }=require('../public/javascripts/fileUpload')
const { ObjectId } = require("mongodb");

const credential={
  email:process.env.ADMIN_EMAIL,  
  password:process.env.ADMIN_PASSWORD
}

var  responseErrbr
var responsebr
var couponErrMssg
var couponSuccessMssg
let errMessage


/* <------------------------------------------------------------------login---------------------------------------------------------> */

let adminLogin = function(req, res, next) {
    if(req.session.adminLoggedIn){
      res.redirect('/admin/dashboard')
    }else{
      res.render('admin/login',{errMessage})
      errMessage=""
    }
  }


/* <---------------------------------------------------------------logged in---------------------------------------------------------> */

let loginPost = (req,res)=>{
    if(req.body.email==credential.email&&req.body.pw==credential.password)
    {
      req.session.adminLoggedIn=true
      
      res.redirect('/admin/dashboard')
    }else{
      errMessage="invalid username or password"
      res.redirect('/admin')
    } 
  }



/* <---------------------------------------------------------------dashboard---------------------------------------------------------> */

let adminDashboard = async(req,res)=>{
    if(req.session.adminLoggedIn){
      try{
  
        let graphs = await   adminHelpers.getTotalReportGraph()
        
  
          let todaySale = await  adminHelpers.getTodaySales()
          let todaySaleAmount = await adminHelpers.getTodaySaleAmount()
          let totalusers = await adminHelpers.getAllUsers()
          let getMonthlyAmount = await adminHelpers.getMonthlyTotal()
          let getCODcount = await adminHelpers.getCODcount()
          let razorpayCount = await adminHelpers.getRazorpaycount()
          let PaypalCount = await adminHelpers.getPaypalcount()
          let {weeklySalesReport,monthlySalesReport,yearlySalesReport}=graphs
          res.render('admin/index',{adminHeader:true,weeklySalesReport,monthlySalesReport,
            yearlySalesReport,todaySale,todaySaleAmount,totalusers,getMonthlyAmount,getCODcount,razorpayCount,PaypalCount})
       
        
      }catch(err){
        res.status(500).render('admin/error',{ message: "something went wrong" })
      }
       
    }else{
      res.redirect('/admin')
    }
  }



/* <---------------------------------------------------------------view user---------------------------------------------------------> */

let viewUser = async(req,res)=>{
 
    if(req.session.adminLoggedIn){
  
  
     let users = await adminHelpers.getAllUsersList() 
        
        res.render('admin/view-user',{adminHeader:true,users})
      
    }else{
      res.redirect('/admin')
    }
  }



/* <---------------------------------------------------------------block user---------------------------------------------------------> */

let blockUser = (req,res)=>{
    const {id}=req.params
    
    adminHelpers.blockUser(id).then((response)=>{
      res.redirect('/admin/viewUser')
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
  }



/* <---------------------------------------------------------------unblock user---------------------------------------------------------> */

let unblockUser = (req,res)=>{
    const {id}=req.params
    console.log(id)
    adminHelpers.unBlockUser(id).then((response)=>{
      res.redirect('/admin/viewUser')
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
  }



/* <---------------------------------------------------------------view products------------------------------------------------------> */

let viewProducts =(req,res)=>{
  
    adminHelpers.getallProducts().then((products)=>{
      res.render('admin/view-products',{adminHeader:true, products})
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
}



/* <---------------------------------------------------------------add product-------------------------------------------------------> */

let addProducts = (req,res)=>{
    adminHelpers. getCategory().then((category)=>{
      
      res.render('admin/add-product',{adminHeader:true,category})
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
    
  }



/* <---------------------------------------------------------------add product post method---------------------------------------------------------> */

let addProductPostMethod = (req,res)=>{
 
    const files = req.files

    const file = files.map((file)=>{
        return file
    })
  
    const fileName = file.map((file)=>{
        return file.filename
    })
    const product = req.body
    product.img = fileName
 
    adminHelpers.addProduct(product).then(()=>{
     
        adminHelpers.addBlockStatus(req.body).then(()=>{
       
        res.redirect('/admin/viewproducts')
    

        }).catch((error)=>{
          res.status(500).render('admin/error',{ message: error.message })
        })
      
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
}



/* <--------------------------------------------------------------block product------------------------------------------------------> */

let blockProduct = (req,res)=>{
    const {id}=req.params
    adminHelpers.blockProducts(id).then(()=>{
      res.redirect('/admin/viewproducts')
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
    
  }



/* <---------------------------------------------------------------unblock product---------------------------------------------------------> */

let unblockProducts = (req,res)=>{
    const {id}=req.params
    adminHelpers.unblockProducts(id).then(()=>{
     res.redirect('/admin/viewproducts')
     
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
    
  }



/* <---------------------------------------------------------------edit product---------------------------------------------------------> */

let getEditProduct = (req,res)=>{
    const {id}=req.params
    if(ObjectId.isValid(id)){
    adminHelpers.getProductForEdit(id).then((products)=>{
      adminHelpers.getCategory().then((brand)=>{
        res.render('admin/edit-product',{adminHeader:true,products,brand})
      }).catch((error)=>{
        res.status(500).render('admin/error',{ message: error.message })
      })
      
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
    }else{
      res.redirect('/admin/*')
    }
  }



/* <-----------------------------------------------------edit product post method----------------------------------------------------> */

let editProductSubmit = async(req,res)=>{
  const {id}= req.params
  
 
    let oldProductDetails= await adminHelpers.getProductForEdit(id)
    const file = req.files
    let filename
    req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldProductDetails.img   
  
      adminHelpers.updateProduct(id,req.body).then(()=>{
        res.redirect('/admin/viewproducts')
        
      }).catch((error)=>{
        res.status(500).render('admin/error',{ message: error.message })
      })
    }



/* <---------------------------------------------------------------view orders-------------------------------------------------------> */

  let viewOrders = (req,res)=>{
    adminHelpers.getProductOrders().then((orders)=>{
     res.render('admin/vieworders',{adminHeader:true,orders})
    }).catch((error)=>{
     res.status(500).render('admin/error',{ message: error.message })
    })
   
 }



/* <---------------------------------------------------------------view order details---------------------------------------------------------> */

 let orderDetails = (req,res)=>{
  const {id}=req.params  
  if(ObjectId.isValid(id)){
  adminHelpers.getOrderProducts(id).then(async(products)=>{
  
    products.forEach(element => {
        if(element.status=="cancelled"){
          element.cancelled=true
        }else if(element.status=="Return-requested"){
          element.returnOrder=true
        }else if(element.status=="Return Approved"){
          element.approved=true
        }else if(element.status=="Refund Approved"){
          element.refunded=true
        }
        else{
          element.cancelled=false
          element.returnOrder=false
          element.approved=false
        }
    });

  let orderDetails = await  adminHelpers.getOrderDetails(id)
    res.render('admin/orders-product-view',{adminHeader:true,products,orderDetails})
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })

  }else{
    res.redirect('/admin/*')} 
}



/* <----------------------------------------------------------view returned orders---------------------------------------------------> */

let returnedOrders = (req,res)=>{
  adminHelpers.getReturnOrders().then((returnOrder)=>{
    returnOrder.forEach(element => {
      console.log(element.status)
      if(element.order.products.status=='Return Approved'){
        
        element.approved=true
        console.log(element.approved)
      }else if(element.order.products.status=="Refund Approved"){
        element.refunded=true
      }else{
        element.approved=false
        console.log(element.approved)
      }
      
    });
    res.render('admin/returned-orders',{adminHeader:true,returnOrder})
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
 
}



/* <---------------------------------------------------------------submit return status---------------------------------------------------------> */

let submitReturnStatus = (req,res)=>{
   
  adminHelpers.updateOrderStatus(req.body).then(()=>{
   res.redirect('/admin/returned-orders')
  }).catch((error)=>{
   res.status(500).render('admin/error',{ message: error.message })
  })
 }



 /* <---------------------------------------------------------------approve refund---------------------------------------------------------> */

let approveRefund = (req,res)=>{
  adminHelpers.refundAmount(req.body).then((response)=>{
    adminHelpers.updateOrderStatus(response).then((data)=>{
      res.json(data)
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })

  })
}



/* <--------------------------------------------------approve refund after cancel-----------------------------------------------------> */

let approveRefundAfterCancel = (req,res)=>{
 
  adminHelpers.refundAmountAfterCancel(req.body).then((response)=>{
    adminHelpers.updateOrderStatus(response).then((data)=>{
      res.json(data)
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
  }).catch(()=>{
    res.json()
  })
}



/* <--------------------------------------------------------------view category---------------------------------------------------------> */

let viewCategory = (req, res)=>{
  adminHelpers.getCategory().then((brand)=>{
    
    res.render('admin/viewCategory',{adminHeader:true,brand })
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
  
}



/* <---------------------------------------------------------------add category---------------------------------------------------------> */

let categoryadd = (req,res)=>{
  res.redirect('/admin/categoryadd')
 }

let addCategory = (req,res)=>{
   
  res.render('admin/addCategory',{adminHeader:true,responsebr,responseErrbr})
  responseErrbr=""
  responsebr=""
 }



/* <-----------------------------------------------------add category post method----------------------------------------------------> */

let addCategoryPostMethod = (req,res)=>{
     
  const files = req.files
const file = files.map((file)=>{
    return file
})
const fileName = file.map((file)=>{
    return file.filename
})
const product = req.body
product.img = fileName
  adminHelpers.brandManagement(product).then((response)=>{
       
      responsebr = response.brandsuccess         
        res.redirect('/admin/categoryadd')
  }).catch((response)=>{
    responseErrbr = response.brandfailed
    res.redirect('/admin/categoryadd')
  })
}



/* <--------------------------------------------------------------edit brand---------------------------------------------------------> */

let getBrandToEdit = (req,res)=>{
  const {id}=req.params
  adminHelpers.getbrandForEdit(id).then((brand)=>{
    
      res.render('admin/edit-brand',{adminHeader:true,brand})
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



/* <------------------------------------------------------edit brand post method-----------------------------------------------------> */

let editBrandPostMethod = async(req,res)=>{
  const {id}=req.params
  let oldBrandDetails= await adminHelpers.getbrandForEdit(id)
  const file = req.files
  let filename
  req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldBrandDetails.img   


  adminHelpers.updateBrand(id,req.body).then(()=>{
    res.redirect('/admin/manageCategory')
    
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



/* <------------------------------------------------------------delete brand---------------------------------------------------------> */

let deleteBrand = (req,res)=>{  
  adminHelpers.deleteBrand(req.body).then(()=>{
    res.json({status:true})
  })
}



/* <------------------------------------------------------------view banners---------------------------------------------------------> */

let viewBanners = (req,res)=>{
  adminHelpers.getBanners().then((banners)=>{
    res.render('admin/view-banners',{adminHeader:true,banners})
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })


}



/* <---------------------------------------------------------------add banner---------------------------------------------------------> */

let addBanner = (req,res)=>{
  res.render('admin/add-banners',{adminHeader:true})
 }



/* <--------------------------------------------------------add banner post method---------------------------------------------------> */

let addBannerPostMethod = (req,res)=>{
  const files = req.files

  const file = files.map((file)=>{
      return file
  })
 
  const fileName = file.map((file)=>{
      return file.filename
  })
  const banner = req.body
  banner.img = fileName
  adminHelpers.addBanners(banner).then(()=>{
    res.redirect('/admin/manage-banners')
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



/* <-------------------------------------------------------------banner edit---------------------------------------------------------> */

let getBannerToEdit = (req,res)=>{
  const {id} = req.params
  adminHelpers.getBannerToEdit(id).then((banner)=>{
    res.render('admin/edit-banner',{adminHeader:true,banner})
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })  
  })
}



/* <-------------------------------------------------------banner edit post method---------------------------------------------------> */

let editBannerPostMethod = async(req,res)=>{
  const {id}=req.params
  let oldBannerDetails= await adminHelpers.getBannerToEdit(id)
  const file = req.files
  let filename
  req.body.img =(req.files.length!=0) ? (filename = file.map((file)=>{ return file.filename })) : oldBannerDetails.img   
  adminHelpers.updateBanner(id,req.body).then(()=>{
    res.redirect('/admin/manage-banners') 
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



let deleteBanner = (req,res)=>{  
  adminHelpers.deleteBanner(req.body).then(()=>{
    res.json({status:true})
  })
}



/* <-------------------------------------------------------update order status-------------------------------------------------------> */

let updateOrderStatus = (req,res)=>{
    adminHelpers.updateOrderStatus(req.body).then(()=>{
      res.json()
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
}



/* <------------------------------------------------------------view coupons---------------------------------------------------------> */

let viewCoupons = async(req,res)=>{
  try{
    let coupons = await adminHelpers.getAllCoupons()
  res.render('admin/manageCoupons',{adminHeader:true,coupons,couponErrMssg,couponSuccessMssg})
  couponErrMssg=""
  couponSuccessMssg=""
  }catch(err){
    res.status(500).render('admin/error',{ message: err })
  }
 
}



/* <--------------------------------------------------------------add coupon---------------------------------------------------------> */

let addCoupon = (req,res)=>{
    
  adminHelpers.addCoupons(req.body).then((response)=>{     
      couponSuccessMssg=response.couponSuccess
      res.redirect('/admin/view-coupons')  
  }).catch((response)=>{
    couponErrMssg=response.couponAlreadyExist
      res.redirect('/admin/view-coupons')
  })
}



let deleteCoupon = (req,res)=>{  
  adminHelpers.deleteCoupon(req.body).then(()=>{
    res.json({status:true})
  })
}

/* <-------------------------------------------------------------view offers---------------------------------------------------------> */

let viewOffers = async(req,res)=>{
  try{
    let offerBrands = await adminHelpers.getOfferBrands()
 adminHelpers.getAllBrands().then((brands)=>{
 
  res.render('admin/view-offers',{adminHeader:true,brands,offerBrands})
 }).catch((error)=>{
  res.status(500).render('admin/error',{ message: error.message })
 })
  }catch(err){
    res.status(500).render('admin/error',{ message: err }) 
  }
}



/* <---------------------------------------------------------------add offer---------------------------------------------------------> */

let addOffer = (req,res)=>{
  adminHelpers.addBrandOffer(req.body).then((catId)=>{
    
    adminHelpers.getProductForOffer(catId).then((products)=>{
      products.forEach(element => {
          adminHelpers.addOfferToProduct(req.body,catId,element)
      });
      res.redirect('/admin/view-offers')
    }).catch((error)=>{
      res.status(500).render('admin/error',{ message: error.message })
    })
    
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



/* <------------------------------------------------------------delete offer---------------------------------------------------------> */

let deleteOffer = (req,res)=>{
  adminHelpers.deleteOffer(req.body).then(()=>{
    res.json()
  }).catch((error)=>{
    res.status(500).render('admin/error',{ message: error.message })
  })
}



/* <------------------------------------------------------------sales report---------------------------------------------------------> */

let salesReport = async(req,res)=>{
  try{
    let dailyReport = await adminHelpers.getDailyReport()
 let monthlyReport = await adminHelpers.getMonthlyReport()
 let yearlyReport = await adminHelpers.getYearlyReport()
 let dailyTotalAmount= await adminHelpers.getDailyTotalSale()
 let monthlyTotalAmount= await adminHelpers.getMonthlyTotalSale()
 let yearlyTotalAmount =  await adminHelpers.getYearlyTotalSale()
 
 res.render('admin/view-salesReport',{adminHeader:true,dailyReport,monthlyReport,yearlyReport,
dailyTotalAmount,monthlyTotalAmount,yearlyTotalAmount })
  }catch(err){
    res.status(500).render('admin/error',{ message: err })
  }
}



/* <--------------------------------------------------------------logout-------------------------------------------------------------> */

let adminLogout = (req,res)=>{
  req.session.adminLoggedIn=""
  res.redirect('/admin')
}



/* <--------------------------------------------------------!!!!!!!!END!!!!!!!!-------------------------------------------------------> */

  module.exports={
    adminLogin,
    loginPost,
    adminDashboard,
    viewUser,
    blockUser,
    unblockUser,
    viewProducts,
    addProducts,
    addProductPostMethod,
    blockProduct,
    unblockProducts,
    getEditProduct,
    editProductSubmit,
    viewOrders,
    orderDetails,
    returnedOrders,
    submitReturnStatus,
    approveRefund,
    approveRefundAfterCancel,
    viewCategory,
    categoryadd,
    addCategory,
    addCategoryPostMethod,
    getBrandToEdit,
    editBrandPostMethod,
    deleteBrand,
    viewBanners,
    addBanner,
    addBannerPostMethod,
    getBannerToEdit,
    editBannerPostMethod,
    updateOrderStatus,
    viewCoupons,
    addCoupon,
    viewOffers,
    addOffer,
    deleteOffer,
    salesReport,
    adminLogout,
    deleteBanner,
    deleteCoupon
  }