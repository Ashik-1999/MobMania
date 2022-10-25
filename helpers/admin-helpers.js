var db=require('../confg/connection')
var collection=require('../confg/collection')
var objectId=require('mongodb').ObjectId
var bcrypt=require('bcrypt')
// const { ORDERS_COLLECTION } = require('../confg/collection')
// const { order } = require('paypal-node-sdk')
// const { Db } = require('mongodb')
// const { response } = require('express')





module.exports={
   


    blockUser:(objId)=>{
        let response={}
        id=objectId(objId)
        console.log(id)
        return new Promise(async(resolve,reject)=>{
            try{
                block=await db.get().collection(collection.USERS_COLLECTION).updateOne({_id:id},{$set:{signupstatus:false}}) 
                     
                resolve(response)  
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
           
        })
    },
    unBlockUser:(objId)=>{
        let response={}
        id=objectId(objId)
       
        return new Promise(async(resolve,reject)=>{
            try{
                unBlock=await db.get().collection(collection.USERS_COLLECTION).updateOne({_id:id},{$set:{signupstatus:true}})
                  
            resolve(response)  
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
            
        })
    },

    addProduct:(product)=>{

        const stock=parseInt(product.stock)
        const price = parseInt(product.ProductPrice)
        const offer = parseInt(product.Offers)
        
        product.stock=stock
        product.ProductPrice = price
        product.Offers = offer

        let brand=objectId(product.brand)
        product.brand=brand
        
        if(product.Offers){
            product.productDiscountPrice=(product.ProductPrice*product.Offers)/100
            product.productOfferPrice=product.ProductPrice-product.productDiscountPrice
            console.log(';;;;;;;;;;;;;');
            console.log(product.productOfferPrice);
            console.log(';;;;;;;;;;;;;');
         }
        
        return new Promise(async(resolve,reject)=>{
            

            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
                
                resolve(data.insertedId)

            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            
            })
        })
    },


    addBlockStatus:(prodData)=>{
        console.log();
         return new Promise(async(resolve,reject)=>{
            try{
            unBlockProd=await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:prodData._id},{$set:{block:false}})
    
             resolve()
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
             
         })
     },

    getallProducts:()=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
         
         resolve(products)
         
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
         
        })
    },

    blockProducts:(objId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(objId)},{$set:{block:true}}).then((response)=>{
            resolve()
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
   


    },

    unblockProducts:(objId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(objId)},{$set:{block:false}}).then((response)=>{
            resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
   


    },


    getProductForEdit:(obId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(obId)}).then((response)=>{
            resolve(response)
            
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
            
        })
    },    

    updateProduct:(objId,productData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(objId)},{
                $set:{
                    ProductName:productData.ProductName,
                    ProductPrice:parseInt(productData.ProductPrice),
                    
                    Discription:productData.Discription,
                    Specs:productData.Specs,
                    Category:productData.Category,
                    color:productData.color,
                    stock:parseInt(productData.stock),
                    img:productData.img
                }
            }).then(()=>{

                console.log(productData)
                resolve()
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },

 
    getProductOrders:()=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                   

                 {
                    $lookup:{
                        from:collection.USERS_COLLECTION,
                        localField:'userId',
                        foreignField:'_id',
                        as:'Account'

                    }
                 },
                 
                 {
                    $project:{
                        
                       deliveryDetails:1,
                       paymentmethod:1,
                     Totalprice:1,
                       date:1,
                       TotalPayment:1,
                       status:1,
                       address:1,
                    //    product:1,
                       Account:{$arrayElemAt:['$Account',0]}
                    }
                 },
                 {
                    $sort:{
                        _id:-1
                    }
                 }
                

            ]).toArray().then((response)=>{ 
                
                resolve(response)
                 }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                 })
            
        })
    },

  

    brandManagement:(data)=>{
        
        console.log(data);
        let response = {}
        return new Promise(async(resolve,reject)=>{
            let brandFind =await db.get().collection(collection.CATEGORY_COLLECTION).findOne({brandname:data.brandname})
            if(brandFind){
                response.brandfailed = true
                reject(response)
               
            }else{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response)=>{

                    
                    
                    response.brandsuccess = true
                    resolve(response)
                    
                })
            }
            
        })
    },




   

    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                category= await  db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
          resolve(category)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
          
            
        })
    },


    getbrandForEdit:(obId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(obId)}).then((response)=>{
            resolve(response)
            
            }).catch((err)=>{
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            })
            
        })
    },    


    updateBrand: (id,data)=>{
        console.log(data);
        let response = {}
        return new Promise(async(resolve,reject)=>{

            try{
                let response = await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(id)},{
                    $set:{
                        brandname:data.brandname,
                        status:data.status,
                        img:data.img
                    }
                   })
                    response.success = true
                    resolve(response)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
          
        })
    },


    deleteBrand:({id})=>{
        console.log(id)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    getOrderProducts:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },

                {
                    $unwind:'$products'
                },
                 {
                     $project:{
                        item:'$products.item',
                        quantity:'$products.quantity',
                        status:'$products.status',
                        userId:1
                        
                        
                    
                    }
                 },
                 {
                     $lookup:{
                         from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                      foreignField:'_id',
                       as:'product'
                   }
                 },
                 {
                    $project:{
                        userId:1,status:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                       
                    }
                 }, 

                 {
                    $addFields:{
                         convertPrice: { $toInt:'$product.ProductPrice'},
                        // convertPrice: { $toInt:'$product.ProductPrice'},
                    }
                 },
                 {
                    $project:{
                        
                       
                        userId:1,totalAmount:{$multiply:['$quantity','$convertPrice']},quantity:1,product:1,status:1,
                       

                    }
                 },
   

            ]).toArray().then((response)=>{ 
              
               
                resolve(response)
                 }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                 })
            
        })
    },


    getOrderDetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let orderDetails = await   db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                    },
                    {
                        $project:{
                            deliveryDetails:1,
                            TotalAmount:1,
                            TotalDiscount:1,
                            TotalPayment:1 ,
                            paymentmethod:1
                        }
                    }
    
                ]).toArray()
                
                    resolve(orderDetails[0])
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }            
        })
    },


    updateOrderStatus:({orderId,proId,status})=>{
       return new Promise((resolve,reject)=>{
        db.get().collection(collection.ORDERS_COLLECTION).updateOne({_id:objectId(orderId),
            "products":{$elemMatch:{"item":objectId(proId)}}},
            {$set:{"products.$.status":status}
        }).then((response)=>{
            resolve(response)   
        }).catch((err)=>{
            let error={}
                error.message = "Something went wrong"
                reject(error)
        })
       })
    },


    


    addBanners:(data)=>{
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        newdate = year + "/" + month + "/" + day;
        data.date=newdate
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then(()=>{
                resolve()
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })

    },


    getBanners:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let banner= await  db.get().collection(collection.BANNER_COLLECTION).find().toArray()
             resolve(banner)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
          
        })
    },


    getBannerToEdit:(bannerId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let banner= await db.get().collection(collection.BANNER_COLLECTION).findOne({_id:objectId(bannerId)})
                resolve(banner)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
           
        })
    },

    updateBanner:(bannerId,bannerData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:objectId(bannerId)},
            {
                $set:{
                    BannerName:bannerData.BannerName,
                    discription1:bannerData.discription1,
                    discription2:bannerData.discription2,
                    img:bannerData.img
                }
            }).then(()=>{
                resolve()
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    deleteBanner:({id})=>{
        console.log(id)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    getReturnOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let returnOrder = await db.get().collection(collection.RETURN_COLLECTION).aggregate([{
                    $lookup:{
                        from:collection.ORDERS_COLLECTION,
                        localField:'orderId',
                        foreignField:'_id',
                        as:'orders'
                    },
                    
                },
                {
                    $project:{
                        proId:1,
                        complaint:1,
                        status:1,
                        Date:1,
                        Discription:1,
                        order:{$arrayElemAt:['$orders',0]}
                    }
                },
                {
                    $unwind:'$order.products'
                },
                {
                    $match:{'order.products.status':{
                        $in:["Return-requested","Return Approved","Refund Approved"]
                    }}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'order.products.item',
                        foreignField:'_id',
                        as:'return-products'
                    }
                },
                {
                    $project:{
                        proId:1,
                        complaint:1,
                        status:1,
                        Date:1,
                        Discription:1,
                        order:1,
                        return_products:{$arrayElemAt:['$return-products',0]}
                    }
                },
                {
                    $match:{
                        $expr:{
                            $eq:["$proId", "$return_products._id"]
                        }
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                }
                
            ]).toArray()
                
                resolve(returnOrder)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
        
            
        })
    },


    refundAmount:({amount,status,userId,orderId,proId})=>{
       
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        
        let Price = parseInt(amount)
        amount = Price

        newdate = day + "/" + month + "/" + year;
        const refundData = {amount,status,userId,orderId,proId}
        let refundObj = {
            orderId:objectId(orderId),
            productId:objectId(proId),
            Refundedamount:amount,
            lastUpdate:newdate
        }
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USERS_COLLECTION)
                    .updateOne({_id:objectId(userId)},
                    {$push:{refundDetails:refundObj}  ,  $inc:{totalWalletAmount:amount}}
                
                    ).then(()=>{
                        resolve(refundData)
                    }).catch((err)=>{
                        let error={}
                        error.message = "Something went wrong"
                        reject(error)
                    })
        })
    },

    refundAmountAfterCancel:({amount,status,userId,orderId,proId,paymentmethod})=>{

        console.log(amount,status,userId,orderId,proId,paymentmethod,"reqq")
       
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        
        let Price = parseInt(amount)
        amount = Price

        newdate = day + "/" + month + "/" + year;
        const refundData = {amount,status,userId,orderId,proId,paymentmethod}
        let refundObj = {
            orderId:objectId(orderId),
            productId:objectId(proId),
            Refundedamount:amount,
            lastUpdate:newdate
        }
        return new Promise((resolve,reject)=>{
            if(!(paymentmethod=="COD")){

            
            db.get().collection(collection.USERS_COLLECTION)
                    .updateOne({_id:objectId(userId)},
                    {$push:{refundDetails:refundObj}  ,  $inc:{totalWalletAmount:amount}}
                
                    ).then(()=>{
                        resolve(refundData)
                    })
        }else{
            reject()
        }
        })
    },



    getTotalReportGraph:()=>{
        return new Promise(async(resolve,reject)=>{
    try{

            let weeklySalesReport = await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $unwind:'$products'
            },
            {
                $match:{
                    'products.status':{
                        $nin:['cancelled','Refund Approved']
                    }
                }
            },
            {
                $group: {
                    _id:  "$date",
                    totalSaleAmount: { $sum: "$TotalPayment" }
                }
            },
            {
                $sort:{
                    '_id':-1,
                }
            },
            {
                $limit:7
            },
            {
                $sort:{
                    '_id':1
                }
            }
        ]).toArray()
        
        let monthlySalesReport= await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
            {
                $unwind:'$products'
        },
        {
            $match:{
                'products.status':{
                    $nin:['cancelled','Refund Approved']
                }
            }
        },
        {
            $group: {
                _id:  "$orderMonth",
                totalSaleAmount: { $sum: "$TotalPayment" }
            }
        },
        {
            $sort:{
                '_id':-1,
            }
        },
        {
            $limit:7
        },
        {
            $sort:{
                '_id':1
            }
        }
     ]).toArray()


     let yearlySalesReport= await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
        {
            $unwind:'$products'
     },
     {
        $match:{
            'products.status':{
                $nin:['cancelled','Refund Approved']
            }
        }
     },
     {
        $group: {
            _id:  "$orderYear",
            totalSaleAmount: { $sum: "$TotalPayment" }

        }
     },
     {
        $sort:{
            '_id':-1,
        }
     },
     {
        $limit:7
     },
     {
        $sort:{
            '_id':1
        }
     }
        
    ]).toArray()
        resolve({weeklySalesReport,monthlySalesReport,yearlySalesReport})
    
    }catch(err){
        let error={}
        error.message = "Something went wrong"
        reject(error)
    }
        
        })
    },



    addCoupons:(couponData)=>{
        let discount= parseInt(couponData.discount)
        couponData.discount=discount
        let response={}
        return new Promise(async(resolve,reject)=>{
            let alreadyCheck= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:couponData.couponCode})
            if(alreadyCheck){
                response.couponAlreadyExist="coupon already exists"
                reject(response)
            }
            else{  
                db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then(()=>{
                   response.couponSuccess="coupon added successfully"
                    resolve(response)
                })
            }
           
        })
    },

    deleteCoupon:({id})=>{
        console.log(id)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(id)}).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    
    getAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let allCoupons = await  db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(allCoupons)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
         
        })
    },



    getDailyReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$date',
                        DailySaleAmount: { $sum: "$TotalPayment" },
                        count:{$sum:1},
                    }
                },
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
                
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    getMonthlyReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$orderMonth',
                        MonthlySaleAmount: { $sum: "$TotalPayment" },
                        count:{$sum:1},
                    }
                },
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
                
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },

    getYearlyReport:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$orderYear',
                        YearlySaleAmount: { $sum: "$TotalPayment" },
                        count:{$sum:1},
                    }
                },
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
                
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })

        })
    },


    getDailyTotalSale:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$orderYear',
                        dailyTotalSaleAmount: { $sum: "$TotalPayment" },
                        
                    }
                },
                {
                    $group:{
                        _id:"",
                        dailyTotalAmount:{$sum:"$dailyTotalSaleAmount"}
                    }
                }
                
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
               
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })

        })
    },


    getMonthlyTotalSale:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$orderYear',
                        MonthlyTotalSaleAmount: { $sum: "$TotalPayment" },               
                    }
                },
                {
                    $group:{
                        _id:"",
                        MonthlyTotalAmount:{$sum:"$MonthlyTotalSaleAmount"}
                    }
                }
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
                
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })

        })
    },


    getYearlyTotalSale:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $group:{
                        _id:'$orderYear',
                        yearlyTotalSaleAmount: { $sum: "$TotalPayment" },
                        
                    }
                },
                {
                    $group:{
                        _id:"",
                        yearlyTotalAmount:{$sum:"$yearlyTotalSaleAmount"}
                    }
                }
                
              
            ]).toArray().then((weekReport)=>{
                resolve(weekReport)
               
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })

        })
    },


    getTodaySales:()=>{

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
    

        newdate = day + "/" + month + "/" + year;
       

        return new Promise(async(resolve,reject)=>{
        
        try{
            let todaySale = await  db.get().collection(collection.ORDERS_COLLECTION).find({date:newdate}).count()
            resolve(todaySale)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
        
        
        })
    },


    getTodaySaleAmount:()=>{
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
    

        newdate = day + "/" + month + "/" + year;
         return new Promise(async(resolve,reject)=>{
        try{
          let todaySaleAmount = await  db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $match:{date:newdate}
                },
                {
                    $group:{
                        _id:"",
                        TodayTotalAmount:{$sum:"$TotalPayment"}
                    }
                }
            ]).toArray()
            resolve(todaySaleAmount)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
         })
    },


    getAllUsersList:()=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                let allUsers = await db.get().collection(collection.USERS_COLLECTION).find().toArray()
                console.log(allUsers)
                resolve(allUsers)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
            
        })
    },

 


    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
        try{

            let allUsers = await db.get().collection(collection.USERS_COLLECTION).find().count()
            resolve(allUsers)
        }catch(err){

            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
        })
    },


    getMonthlyTotal:()=>{
        return new Promise(async(resolve,reject)=>{
        try{

            let MonthlyTotal = await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $unwind:'$products'
            },
            {
                $match:{
                    'products.status':{
                        $nin:['cancelled','Refund Approved']
                    }
                }
            },
            {
                $group: {
                    _id:  "$orderMonth",
                    totalSaleAmount: { $sum: "$TotalPayment" }
                }
            },
            {
                $sort:{
                    '_id':-1,
                }
            },
            {
                $limit:1
            },
            {
                $sort:{
                    '_id':1
                }
            }
            
            ]).toArray()
            resolve(MonthlyTotal)
        }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
        }
        })
    },



    getCODcount:()=>{
        return new Promise(async(resolve,reject)=>{
        try{
            let CODtotal = await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $unwind:'$products'
            },
            {
                $match:{
                    'products.status':{
                        $nin:['cancelled','Refund Approved']
                    }
                }
            },
            {
                $match:{paymentmethod:"COD"}
            },
            {
                $group:{
                    _id:"",
                    count:{$sum:1},
                }
            }
           
            
            ]).toArray()
            resolve(CODtotal)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
        })
    },


    getRazorpaycount:()=>{
        return new Promise(async(resolve,reject)=>{
            try{

            let RazorpayTotal = await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $unwind:'$products'
            },
            {
                $match:{
                    'products.status':{
                        $nin:['cancelled','Refund Approved']
                    }
                }
            },
            {
                $match:{paymentmethod:"Online"}
            },
            {
                $group:{
                    _id:"",
                    count:{$sum:1},
                }
            }
           
            
            ]).toArray()
            resolve(RazorpayTotal)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
        })
    },


    getPaypalcount:()=>{
        return new Promise(async(resolve,reject)=>{
            try{

            
            let PaypalTotal = await db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                    $unwind:'$products'
            },
            {
                $match:{
                    'products.status':{
                        $nin:['cancelled','Refund Approved']
                    }
                }
            },
            {
                $match:{paymentmethod:"paypal"}
            },
            {
                $group:{
                    _id:"",
                    count:{$sum:1},
                }
            }
           
            
            ]).toArray()
            resolve(PaypalTotal)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
        })
    },



    getAllBrands:()=>{
        return new Promise(async(resolve,reject)=>{
        try{

           let allBrands = await  db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
           resolve(allBrands)
        }catch(err){
            let error={}
            error.message = "Something went wrong"
            reject(error)
        }
         
        })
    },


    addBrandOffer:({brand,offer,Expirydate})=>{
        let brandOffer= parseInt(offer)
        offer=brandOffer
        

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(brand)},
            {$set:{
                offer:offer,
                Expirydate:Expirydate,
                offerApply:true
            }
        },{upsert:true}).then(()=>{
            
            resolve(brand)
        }).catch((err)=>{
            let error={}
            error.message = "Something went wrong"
            reject(error)
        })
    })
    },


    getOfferBrands:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let offeredBrands = await db.get().collection(collection.CATEGORY_COLLECTION).find({offerApply:true}).toArray()
                resolve(offeredBrands)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
            
            
        })
    },


    getProductForOffer:(catId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:objectId(catId)}).toArray()
            
                resolve(products)
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
           
        })
    },


    addOfferToProduct:({brand,offer,Expirydate},catId,product)=>{
        let offerPercentage = parseInt(offer)
        offer = offerPercentage
         let productprice= parseInt(product.ProductPrice)
         product.ProductPrice = productprice

         OfferPrice = (offer/100)*product.ProductPrice
         totalPrice =  product.ProductPrice-OfferPrice
        

        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:product._id,brand:objectId(catId)},
                {$set:{
                    DiscountPercentage:offer,
                    brandDiscount:OfferPrice,
                    ProductPrice:totalPrice,
                    OriginalPrice:product.ProductPrice
            }
        }).then(()=>{
            resolve()
        })
        })


    },


    deleteOffer:({brandId})=>{
        
        return new Promise(async(resolve,reject)=>{
            let brand = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(brandId)})
            

            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(brandId)},
            {
                $unset:{
                    Expirydate:brand.Expirydate,
                    offer:brand.offer,
                    offerApply:true
                }
            }).then(async()=>{
              let product= await  db.get().collection(collection.PRODUCT_COLLECTION).find({brand:objectId(brandId)}).toArray()
                
              db.get().collection(collection.PRODUCT_COLLECTION).updateMany({brand:objectId(brandId)},
              {
                $unset:{
                    DiscountPercentage:product.DiscountPercentage,
                    ProductPrice:product.ProductPrice,
                    brandDiscount:product.brandDiscount
                  }  
                
              }).then(()=>{
                db.get().collection(collection.PRODUCT_COLLECTION).updateMany({brand:objectId(brandId)},
                {
                    $rename:{OriginalPrice:'ProductPrice'}
                })
                resolve()

              }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
            
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
            
        })
    }
  
}

