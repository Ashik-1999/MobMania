const db=require('../confg/connection')
const collection=require('../confg/collection')
const bcrypt=require('bcrypt')

const Razorpay = require('razorpay')
const { resolve } = require('path')
// const paypal = require('paypal-node-sdk')

// const { resolve } = require('path')
// const { USERS_COLLECTION } = require('../confg/collection')
var objectId=require('mongodb').ObjectId

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEYID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


  
  

module.exports={
    doSignup:(userData)=>{
        
        let userExist=false
        return new Promise(async(resolve,reject)=>{
        try{
            let alreadyUser=await db.get().collection(collection.USERS_COLLECTION).findOne({$or:[{email:userData.email},{number:userData.number}]})

            if(alreadyUser){
                userExist=true
                resolve(userExist)
            }else{

                userData.totalWalletAmount = 0
                userData.pwconfirm=userData.pw.toString()
                userData.pw=userData.pwconfirm.toString()
                userData.pw=await bcrypt.hash(userData.pw,10)
                userData.pwconfirm=await bcrypt.hash(userData.pwconfirm,10)
                db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                    userExist=false
                    resolve(userExist)
                    
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })

            }
        }    
        catch(err){
            let error={}
                error.message = "Something went wrong"
                reject(error)
         } 

            
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            try{
                let userLogin=await db.get().collection(collection.USERS_COLLECTION).findOne({email:userData.email})
                if(userLogin){
                    if(userLogin.signupstatus){
                        bcrypt.compare(userData.pw,userLogin.pw).then((status)=>{
                            if(status){
                                console.log('+++++++++++++')
                                console.log('login success')
                                console.log('+++++++++++++')
                                response.userdata=userLogin
                                response.status=true
                                resolve(response)
                            }else{
                               
                                response.status=false
                                response.errMessage="Invalid password"
                                
                                
                                reject(response)
                            }
                        }).catch((error)=>{
                            reject(error)
                        })
                    }else{
                        
                                response.status=false
                                response.errMessage="You are Blocked"
                                reject(response)
                        
                    }
                }else{
                    response.status=false
                    response.errMessage="Invalid mail id"
                    reject(response)
                }
            }
           
            catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             } 

        })
    },

    getOTP:async(userData)=>{
        let response={}
        
        return new Promise(async(resolve,reject)=>{
            try{
                let otpuser= await db.get().collection(collection.USERS_COLLECTION).findOne({number:userData.number})
            if(otpuser){
               if (otpuser.signupstatus==false){
                    response.status=false
                    response.err="you are blocked"

                    reject(response)
                }else{
                    response.mobile=userData.number
                    response.status=true
                    response.user=otpuser
                   
                    resolve(response)
                    }
            }
            else{
                response.status=false
                response.err="enter a valid number"

                reject(response)
            }
            }
            catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             } 
        
        })
    },



    getCategoryBrands:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                category= await  db.get().collection(collection.CATEGORY_COLLECTION).find().limit(6).toArray()
                resolve(category)
            } catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             }  
         
            
        })
    },


    getCategoryProducts:(brandId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                console.log(brandId)
                let product= await  db.get().collection(collection.PRODUCT_COLLECTION).find({brand:objectId(brandId)}).toArray()
                resolve(product)
            } catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             } 
          
        })
    },

    AddStatus:(userData)=>{
        console.log(userData);
         return new Promise(async(resolve,reject)=>{
            try{
                unBlock=await db.get().collection(collection.USERS_COLLECTION).updateOne({email:userData.email},{$set:{signupstatus:true}})
            
                resolve()
            } catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             } 
            
         })
     },

     getPaginatedResult:(limit,skip)=>{
       
        
        return new Promise(async(resolve,reject)=>{
            try{
                let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({block:false}).limit(limit).skip(skip).toArray()
            
                resolve(products)
            }
            catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             }  
         
        })
    },

    getProducts:()=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                let products= await db.get().collection(collection.PRODUCT_COLLECTION).find({block:false}).toArray()
         
         resolve(products)
         
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                reject(error)
            }
         
        })
    },

     ProductView:(obId)=>{
        return new Promise((resolve,reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(obId)}).then((response)=>{
                    resolve(response)
                    
                    })
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             } 
           
            
        })
    }, 


    addToCart:(proId,userId)=>{
        let prodObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let cartFind=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cartFind){
                let prodExist=cartFind.products.findIndex(product=> product.item==proId)
                if(prodExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'products.item':objectId(proId),user:objectId(userId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    }).catch((err)=>{
                        let error={}
                        error.message = "Something went wrong"
                        reject(error)
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $push:{products:prodObj}
                    }
                    ).then(()=>{
                    

                    resolve()
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
                }


            }else{
                cartObj={
                    user:objectId(userId),
                    products:[prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(()=>{
                    
                    
                    resolve()                                           
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
            }
        })
    },


    getCartProducts:(userId)=>{
        let cartStatus={}
        return new Promise(async (resolve,reject)=>{
            let cartFind=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cartFind){
                
                db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user:objectId(userId)}
                    },

                    {
                        $unwind:'$products'
                    },
                     {
                         $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
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
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
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
                           
                            total:{$multiply:['$quantity','$convertPrice']},item:1,quantity:1,product:1
                        }
                     }

                ]).toArray().then((response)=>{ 
                    
                  
                    resolve(response)
                     }).catch((err)=>{
                        let error={}
                    error.message = "Something went wrong"
                    reject(error)
                     })

            }else{
                cartStatus.noItem=true
                cartStatus.NoCartMessage="cart is empty"
                resolve(cartStatus)
            }
        })
    },


     removeProduct:({product,cart})=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(cart)},{$pull:{
                    products:{  
                        item:objectId(product)
                    }
                }
            }   
            ).then((response)=>{
            
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },

    
    getCartCount:(userId)=>{
        return new Promise((resolve,reject)=>{
            let count=0
             db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)}).then((user)=>{
                 if(user){
                    
                    count=user.products.length
                    
                }
                 if(count==0){
                     resolve()
                 }else{ 
                    resolve(count)
                }
                
               
             }).catch((err)=>{
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
             })
            
        })
    },


    changeProductQuantity:({cart,product,count,quantity})=>{
       let response={}
       
        count=parseInt(count)
        return new Promise(async(resolve,reject)=>{

            if(quantity==1&&count==-1){
                response.decLimit=true
                reject(response)
            }else{
                if(count!=-1){
                    let stockCheck = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(product)})
                     if(quantity >= stockCheck.stock){
                        response.outOfStockErr=true
                        reject(response)
                    }else{
    
                        db.get().collection(collection.CART_COLLECTION)
                        .updateOne({'products.item':objectId(product),_id:objectId(cart)},
                        {
                            $inc:{'products.$.quantity':count}
                        }
                        
                        ).then(async(data)=>{
    
                         response.decLimit=false
                        response.outOfStockErr=false
                        resolve(response) 
                        }).catch((err)=>{
                            let error={}
                            error.message = "Something went wrong"
                            reject(error)
                        })
                    }
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'products.item':objectId(product),_id:objectId(cart)},
                    {
                        $inc:{'products.$.quantity':count}
                    }
                    
                    ).then(async(data)=>{

                     response.decLimit=false
                    response.outOfStockErr=false
                    resolve(response)  
                    }).catch((err)=>{
                        let error={}
                    error.message = "Something went wrong"
                    reject(error)
                    })
                }        
                }
        })
    },

    getGrandTotal:(user)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(user)}
                },

                {
                    $unwind:'$products'
                },
                 {
                     $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
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
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                 }, 

                 {
                    $addFields:{
                         convertPrice: { $toInt:'$product.ProductPrice'},
                        // convertPrice: { $toInt:'$product.ProductPrice'},
                    }
                 },
                 {
                    $group:{
                        _id:null,
                       
                        totalAmount:{$sum:{$multiply:['$quantity','$convertPrice']}}
                    }
                 },{
                    $project:{totalAmount:1,_id:0}
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


    placeOrder:(order,cartItmes,total,discount)=>{

       
       
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        let orderObj
        let userAddress

        newdate = day + "/" + month + "/" + year;
        ordermonth=month + "/" + year
        return new Promise((resolve,reject)=>{
            
            
         let status=(order.paymentmethod=='COD'||order.paymentmethod=='wallet')?'placed':'pending'
         let shippingStatus=status=='placed'?'order placed':'pending'
         console.log(status,"statuis")

         if(discount.TotalAfterDiscount){
				
          orderObj={
                userId:objectId(order.userId),
                deliveryDetails:{
                     customerName:order.fullName,
                    mobile:order.number,
                    email:order.email,
                    address:{
                        HouseName:order.address,
                        streetName:order.streetName,
                        landmark:order.landmark,
                        city:order.city,
                        state:order.state,
                        pincode:order.pincode,
                        
                    }
                },
                cartEach:cartItmes.products.forEach(cartProd=>{
                    cartProd.status=shippingStatus
                }),

                paymentmethod:order.paymentmethod,
                status:status,
                // orderStatus:order.orderStatus,
                products:cartItmes.products,
                TotalAmount:total,
                TotalDiscount:discount.discountedPrice,
                TotalPayment:discount.TotalAfterDiscount,
                couponApply:true,
                date:newdate,
                orderMonth:ordermonth,
                orderYear:year

            }
             userAddress={}
            userAddress.orderAddress=orderObj.deliveryDetails
            userAddress.userId=orderObj.userId
         }else{
            orderObj={
                userId:objectId(order.userId),
                deliveryDetails:{
                     customerName:order.fullName,
                    mobile:order.number,
                    email:order.email,
                    address:{
                        HouseName:order.address,
                        streetName:order.streetName,
                        landmark:order.landmark,
                        city:order.city,
                        state:order.state,
                        pincode:order.pincode,
                        
                    }
                },
                cartEach:cartItmes.products.forEach(cartProd=>{
                    cartProd.status=shippingStatus
                }),

                paymentmethod:order.paymentmethod,
                status:status,
                // orderStatus:order.orderStatus,
                products:cartItmes.products,
                
                TotalAmount:total,
                TotalDiscount:0,
                TotalPayment:total,

                couponApply:false,
                date:newdate,
                orderMonth:ordermonth,
                orderYear:year

            }
            userAddress={}
            userAddress.orderAddress=orderObj.deliveryDetails
            userAddress.userId=orderObj.userId
         }
        
    

           db.get().collection(collection.ORDERS_COLLECTION).insertOne(orderObj).then(async(response)=>{
            
           let objorder={}
            objorder.insertId=response.insertedId

            if(status=="placed"){
               
                    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                    let user= await db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(order.userId)})
                    db.get().collection(collection.USERS_COLLECTION).updateOne({_id:user._id},{$unset:{couponId:user.couponId}})
               
            }


                   db.get().collection(collection.ADDRESS_COLLECTION).insertOne(userAddress)

                if(status=="placed"){
                    
                    db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                        {
                        $match:{_id:response.insertedId}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:"$products.item",
                            quantity:"$products.quantity"
                        }
                    }
                ]).toArray().then((response)=>{

                    objorder.productData=response
                    resolve(objorder)

                }).catch((err)=>{
                    let error={}
                error.message = "Something went wrong"
                reject(error) 
                })
                }else{
                    resolve(objorder)
                }
           }).catch((err)=>{
            let error={}
                error.message = "Something went wrong"
                reject(error)
           })
            
        })
    },


    useRazorpay:(orderId,total,coupon)=>{
        
       return new Promise((resolve,reject)=>{
        
												
     if(coupon.TotalAfterDiscount)   {
        var options = {
            amount:coupon.TotalAfterDiscount *100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+orderId
          };
     }else{
        var options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: ""+orderId
          };
     }
       
            instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err)
                }else{
                    
                    resolve(order)
                }
               
              });   
       })
    },


    getOrderForPaypal:({orderId})=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).findOne({_id:objectId(orderId)}).then((orders)=>{
                resolve(orders)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },





    verifyPayment:(paymentDetails)=>{
        return new Promise((resolve,reject)=>{
            var crypto = require("crypto");
            var expectedSignature = crypto.createHmac('sha256', 'QunH4gMem13MRSdBZkft3yfH')
            .update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]'])
            .digest('hex');
            // console.log("sig received " ,req.body.response.razorpay_signature);
            // console.log("sig generated " ,expectedSignature);
            if(expectedSignature==paymentDetails['payment[razorpay_signature]']){
               
                resolve()
            }else{
                
                reject()
            }
        })

    },



    afterPaymentSuccess:(orderId,userId)=>{
        return new Promise(async(resolve,reject)=>{
           
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userId)})
            let user= await db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(userId)})
            db.get().collection(collection.USERS_COLLECTION).updateOne({_id:user._id},{$unset:{couponId:user.couponId}})
           
            db.get().collection(collection.ORDERS_COLLECTION).aggregate([
                {
                $match:{_id:objectId(orderId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:"$products.item",
                    quantity:"$products.quantity"
                }
            }
        ]).toArray().then((productData)=>{

            
            resolve(productData)

        }).catch((err)=>{
            let error={}
            error.message = "Something went wrong"
            reject(error)
        })
        })
    },



    changeStatusPendingToPlaced:({_id,item,quantity})=>{
        return new Promise((resolve,reject)=>{
           
                db.get().collection(collection.ORDERS_COLLECTION).updateOne({_id:_id,"products":{$elemMatch:{"item":objectId(item)}}},
                {
                    $set:{"products.$.status":"order Placed"}
                })
                resolve()
           
        })
    },


    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDERS_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{status:"placed"}
            }).then(()=>{
                resolve()
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },


    decrementStock:(data)=>{
        return new Promise((resolve,reject)=>{
            try{
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:data.item},
                    {
                        $inc:{stock:-data.quantity}
                    })
                    resolve()
            }catch(err){
                let error={}
                error.message = "Something went wrong"
                
                reject(error)
            }
                
            
        })
    },

    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          try{
            let cartProducts= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cartProducts)
          }catch(err){
            
            let error={}
            error.message = "Something went wrong"
            reject(error)
            
          }
               
           
        })
    },


    getOrderSummary:(orderId)=>{
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
                        date:1,
                        TotalAmount:1,
    
                        TotalDiscount:1,
                    
                        TotalPayment:1
                        
                        
                    
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
                      date:1, status:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]} ,TotalAmount:1,
    
                      TotalDiscount:1,
                  
                      TotalPayment:1
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
                        
                       
                        date:1,totalAmount:{$multiply:['$quantity','$convertPrice']},quantity:1,product:1,status:1,Totalprice:1,deliveryDetails:1,
                        TotalAmount:1,
    
                        TotalDiscount:1,
                    
                        TotalPayment:1
                        

                    }
                 },
               

            ]).toArray().then((response)=>{ 
                
               console.log(response,"summaryyy")
                resolve(response)
                 }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                 })
        })
    },

    
    getGrandTotalForSummary:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let total = await db.get().collection(collection.ORDERS_COLLECTION).findOne({_id:objectId(orderId)})
            console.log(total)
            resolve(total)
        })
    },


    


    getFullOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let orders= await  db.get().collection(collection.ORDERS_COLLECTION).find({userId:objectId(userId)}).sort({_id:-1}).toArray()
                
                resolve(orders)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
          
        })
    },
    getOrders:(orderId)=>{
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
                        date:1
                        
                    
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
                      date:1, status:1,item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
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
                        
                       
                        date:1,totalAmount:{$multiply:['$quantity','$convertPrice']},quantity:1,product:1,status:1,Totalprice:1,deliveryDetails:1,

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



    returnOrder:(returnData)=>{
        orderId=objectId(returnData.orderId)
        returnData.orderId=orderId

        proId=objectId(returnData.proId)
        returnData.proId=proId
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.RETURN_COLLECTION).insertOne(returnData).then(()=>{
                resolve()
            }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
            })
            
        })
    },


   

    
 stockIncrement:({proId,quantity})=>{
    
    quantity=parseInt(quantity)
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
            {
                $inc:{stock:quantity}
            }).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            })
    })

 },


    addToWishlist:(proId,userId)=>{


       
        let product=proId
        
        
        return new Promise(async(resolve,reject)=>{
            
            let findWishlist=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
           
            
            if(findWishlist){
                let prodExist=findWishlist.products.findIndex((product)=>product==objectId(product))
                
                if(prodExist!=-1){
                    
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $pull:{products:objectId(product)}
                    }
                    ).then(()=>{
                    
                    
                    resolve()
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
                }else{
                    
                    db.get().collection(collection.WISHLIST_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $addToSet:{products:objectId(product)}
                    }
                    ).then(()=>{
                   
                    resolve()
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
                }
                

            }else{
                wishlistObj={
                    user:objectId(userId),
                    products:[objectId(product)]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then(()=>{
                    
                   
                    resolve()                                           
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
            }
        })
    },

    getWishlistProducts:(userId)=>{
        
        userId = objectId(userId)
        let wishlistStatus={}
        return new Promise(async (resolve,reject)=>{
            let wishlistFind=await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:userId})
           
            if(wishlistFind.products.length!=0){
                
                db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                    {
                        $match:{user:userId}
                    },

                    {
                        $unwind:'$products'
                    },
                    
                   
                     {
                         $lookup:{
                             from:collection.PRODUCT_COLLECTION,
                            localField:'products',
                          foreignField:'_id',
                           as:'product'
                       }
                     },
                     {
                        $project:{
                            products:1,product:{$arrayElemAt:['$product',0]}
                        }
                     }, 

                   

                ]).toArray().then((response)=>{ 
                 
                    resolve(response)
                     })

            }else{
                
                wishlistStatus.NoWishlistMessage="No items in the wishlist"
                console.log(wishlistStatus)
                reject(wishlistStatus)
                
            }
        })
    },


    wishlistProducts:(userId)=>{
        
      let  userid=objectId(userId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:userid}
                },

                {
                    $unwind:'$products'
                },
                
               
                 {
                     $lookup:{
                         from:collection.PRODUCT_COLLECTION,
                        localField:'products',
                      foreignField:'_id',
                       as:'product'
                   }
                 },
                 {
                    $project:{
                        products:1,product:{$arrayElemAt:['$product',0]}
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

    removeWishlistProduct:({product,wishlist})=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({_id:objectId(wishlist)},{$pull:{
                    products:objectId(product)
                    
            }
        }   
            ).then((response)=>{
            
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error)
            })
        })
    },

    getWishlistCount:(userId)=>{
        return new Promise((resolve,reject)=>{
            let count=0
             db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)}).then((wishlist)=>{
                 if(wishlist){
                    
                    count=wishlist.products.length
                    
                }
                if(count==0){
                    resolve()
                }else{ 
                    
                    resolve(count)
                }
                
               
             })
            
        })
    },


    changePassword:({oldpassword,newpassword},userId)=>{
        

        return new Promise(async(resolve,reject)=>{
    
            let response = {}
    
           let userfind = await db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(userId)})
          console.log(userfind)
           if(userfind){
           
            oldpassword=oldpassword.toString()
            bcryptpass=await bcrypt.hash(oldpassword,10)
    
            bcrypt.compare(oldpassword,userfind.pw).then(async (status)=>{
    
                if(status){
    
                    response.check = true;
                    response.successMessage="password reseted successfully"
    
                    newpassword=newpassword.toString()
                    bcryptNewPass=await bcrypt.hash(newpassword,10)
    
                    db.get().collection(collection.USERS_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                           pw:bcryptNewPass 
                        }
                    }).then(()=>{
                        resolve(response)
                    })
    
                }else{
                    response.check=false,
                    response.errmessage = "old password is incorrect"
                     reject(response)
                }
            })
        } 
        })
     },


     getUserDatatoEdit:(userId)=>{
        console.log(userId,"lLLLLL")
        return new Promise(async(resolve,reject)=>{
            try{
                let userDetails= await  db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(userId)})
          
                resolve(userDetails)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
          
        })
     },

     
     editUserData:(userData,userId)=>{
        let {name}=userData
        let{email}=userData
        let{number}=userData
        console.log(userId,"userId")
        user= objectId(userId)
        userId= user
        let response={}
        console.log(name,email,number,userId)
        return new Promise(async(resolve,reject)=>{
            let userCheck=await db.get().collection(collection.USERS_COLLECTION).findOne({email:email,_id:{$ne:userId}})
            console.log(userCheck)
            if(userCheck){
                response.mailExist=true
                response.errMessage="Email id already exists"
                reject(response)
            }else{
                db.get().collection(collection.USERS_COLLECTION).updateOne({_id:userId},{
                    $set:{
                        name:name,
                        email:email,
                        number:number
                    }
                }).then(()=>{
                    response.successMessage="data upated successfully"
                    response.mailExist=false
                    resolve(response)
                })
            }
           
        })
     },


     getUserOrderAddress:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).aggregate([{
                $match:{ userId:objectId(userId )},
                
            },
            {
                $group:{
                    _id:"$orderAddress"
                }
            },

        ]).toArray().then((address)=>{
            
            resolve(address)
        }).catch((err)=>{
            let error={}
                error.message = "Something went wrong"
                reject(error)
        })
        })
     },


     addExistingAddress:({cusName,cusHouseName},userId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).aggregate([
                {
                $match:{
                    $and:[
                        {userId:objectId(userId)},
                        {'orderAddress.customerName':cusName},
                        {'orderAddress.address.HouseName':cusHouseName}
                    ]
                },
            },
            {
                $group:{
                    _id:"$orderAddress"
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


     deleteAddress:({cusName,cusHouseName},userId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({
                $and:[
                    {userId:objectId(userId)},
                    {"orderAddress.customerName":cusName},
                    {'orderAddress.address.HouseName':cusHouseName}
                ]
            }).then((response)=>{
                resolve(response)
            }).catch((err)=>{
                let error={}
                error.message = "Something went wrong"
                reject(error) 
            })
        })
     },


     applyCoupon:({code},total,userId)=>{

        let response={}

        let d = new Date()
                let  month = '' + (d.getMonth() + 1)
                let day = '' + d.getDate()
                let year = d.getFullYear()



                if (month.length < 2) 
                    month = '0' + month;
                if (day.length < 2) 
                    day = '0' + day;



                 let time = [year, month, day].join('-')

        console.log(code,total,userId)
        return new Promise(async(resolve,reject)=>{
            let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:code})
            if(couponFind){
                response.couponFind=true
                let currentDate= time
                console.log(currentDate)
                console.log(couponFind.Expirydate)
                if(currentDate >couponFind.Expirydate){
                    response.expiredCoupon=true
                    response.couponExpired="Sorry, Coupon is expired"
                    console.log(response.couponExpired)
                    reject(response)
                }else{
                    response.expiredCoupon=false
                   let couponAlreadyApplied = await db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).findOne({userId:objectId(userId), couponId:couponFind._id})
                    if(couponAlreadyApplied){

                        response.appliedCoupon=true
                        response.couponApplied="Coupon already Applied"
                        reject(response)
                        
                    }else{
                        response.appliedCoupon=false
                        response.couponAppliedSuccess="Coupon Successfully applied"
                      let  couponDiscountpercentage = couponFind.discount
                      let  discountPrice=Math.ceil((couponDiscountpercentage/100)*total)
                      let totalPriceAfterOffer=total-discountPrice
                      response.totalPriceAfterOffer=totalPriceAfterOffer
                      response.discountPrice=discountPrice

                        appliedCouponObj={
                            userId:objectId(userId),
                            couponId:couponFind._id
                        }
                        db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).insertOne(appliedCouponObj)
                            resolve(response)
                        db.get().collection(collection.USERS_COLLECTION).updateOne({_id:objectId(userId)},
                            {
                                $set:{couponId:couponFind._id}
                        },{upsert:true}
                        )
                        
                    }
                }
            }else{
                response.couponFind=false
                response.couponNotFound="Coupon not found"
                reject(response)
            }
        
        })
     },



     getCouponPrice:(userId,total)=>{
        let totalPrice=total.totalAmount

        console.log(userId,total,"^^^^^^^^^^^^^^^^^^6")
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.USERS_COLLECTION,
                        localField:'user',
                      foreignField:'_id',
                       as:'user'
                }
            },
            {
                $project:{
                    user:{$arrayElemAt:['$user',0]}
                }
                  
            },
            {
                $lookup:{
                    from:collection.COUPON_COLLECTION,
                    localField:'user.couponId',
                  foreignField:'_id',
                   as:'coupon'
                }
            },  
            {
                $project:{
                    user:1,coupon:{$arrayElemAt:['$coupon',0]}
                }
            },
            {
                $project:{
                    discountedPrice: { $multiply: [ {$divide: [  "$coupon.discount", 100 ]},totalPrice] },coupon:1
                    
                }
            },
            {
                $project:{
                    discountedPrice:1,
                    TotalAfterDiscount: { $subtract: [totalPrice,'$discountedPrice' ] },
                    couponId:"$coupon._id",

                }
            }
            
            ]).toArray().then((response)=>{
                resolve(response)
               
                
            })
        })
     },


     deleteCoupon:(couponId,userId)=>{
        console.log(userId )
      
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USERS_COLLECTION).updateOne({_id:objectId(userId)},
                {$unset:{
                    couponId:objectId(couponId)
                }
            }).then(()=>{
                db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).deleteOne({userId:userId,couponId:objectId(couponId)}).then(()=>{
                    resolve()
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error) 
                })
               
            })
           
        })
     },



     getSearchProducts:(searchProducts)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let searchedItem = await db.get().collection(collection.PRODUCT_COLLECTION).find({ProductName:{'$regex':searchProducts,$options:'i'}}).limit(10).toArray()
            resolve(searchedItem)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
            
           

        })
     },



     getcategoryProductsCount:(category)=>{
        return new Promise(async(resolve,reject)=>{
         let count = await  db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{
                    brand:category._id
                }
            },
            {
                $group:{
                    _id:"$brand",
                    count:{$sum:1}

                }
            },
            
           ]).toArray()
           resolve(count)
            
           
        })
     },



     getFilterProducts:(filters)=>{
        
        return new Promise(async(resolve,reject)=>{
            let check = Array.isArray(filters.brandName)
            
            if(check){
                var brandNames=filters.brandName

                    brandNames =   brandNames.map(function(brand){
                        return  objectId(brand)
                    })      
            }
            else{
                filters  = Object.values(filters);  
                var brandNames =   filters.map(function(brand){
                    
                    
                    return objectId(brand) 
                  })    
                      

            }
           let filterProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{
                    brand:{
                        $in:brandNames
                    }
                }
            }
           ]).toArray()
           resolve(filterProducts)
           
        }).catch((err)=>{
            let error={}
            error.message = "Something went wrong"
            reject(error)
        })
     },


     getProductsCount:()=>{
        return new Promise(async(resolve, reject) => {
         let count= await db.get().collection(collection.PRODUCT_COLLECTION).find().count()
          resolve(count)
        })
    },


    getWalletDetails:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try{
                let data = await db.get().collection(collection.USERS_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(userId)}
                    },
                    {
                        $unwind:'$refundDetails'
                    },
                    {
                        $project:{
                            orderId:'$refundDetails.orderId',
                            prodId:'$refundDetails.productId',
                            amount:'$refundDetails.Refundedamount',
                            refundDate:'$refundDetails.lastUpdate'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.ORDERS_COLLECTION,
                            localField:'orderId',
                          foreignField:'_id',
                           as:'orders'
                    }
                    },
                    {
                        $project:{
                            prodId:1,amount:1,refundDate:1,orders:{$arrayElemAt:['$orders',0]}
                        }
                     }, 
                     {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'prodId',
                          foreignField:'_id',
                           as:'products'
                    }
                    
                },
                {
                    $project:{
                        orders:1,amount:1,refundDate:1,products:{$arrayElemAt:['$products',0]}
                    }
                 }, 
                 {
                    $sort:{
                        refundDate:-1
                    }
                 }
                
                ]).toArray()
                   resolve(data)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
           
        
        })
    },

    getRefundTotal:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let refundTotal = await db.get().collection(collection.USERS_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(userId)}
                    },
                    {
                        $unwind:'$refundDetails'
                    },
                    {
                        $project:{
                            refundDetails:1
                        }
                    },
                    {
                        $group:{
                            _id:"",
                            totalRefund:{$sum:"$refundDetails.Refundedamount"}
    
                        }
                    }  
                ]).toArray()
                
                   resolve(refundTotal)
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
            
        })
    },

    addRefundTotalToUser:(userId,totalRefund)=>{
        return new Promise((resolve,reject)=>{
            try{
                db.get().collection(collection.USERS_COLLECTION).updateOne({_id:objectId(userId)},{$set:{totalWallet:totalRefund}}).then(()=>{
                    resolve()
                })
            }catch(err){
                let error={}
                    error.message = "Something went wrong"
                    reject(error)
            }
           
        })
    },


    checkWalletAmount:(total,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(userId)})
                if(user.totalWalletAmount){
                    if(user.totalWalletAmount < total){
                        reject()
                    }else{
                        db.get().collection(collection.USERS_COLLECTION).updateOne({_id:objectId(userId)},{$inc:{totalWalletAmount:-total}})
                        resolve()
                    }
                    
                }else{
                    reject()
                }
        })
    },

    walletCheck:(userId,total)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({_id:objectId(userId)})
            if(user.totalWalletAmount){
                if(user.totalWalletAmount < total){
                    reject()
                }else{
                   
                    resolve()
                }
                
            }else{
                reject()
            }

        })
    },


    addToRecentlyViewed:(proId,userId)=>{
        let product = proId
        return new Promise(async(resolve,reject)=>{      
                    db.get().collection(collection.USERS_COLLECTION)
                    .updateOne({_id:objectId(userId)},
                    {
                        $addToSet:{recentlyViewed:objectId(product)}
                    }
                    ).then(()=>{
                    
                    
                    resolve()
                }).catch((err)=>{
                    let error={}
                    error.message = "Something went wrong"
                    reject(error)
                })
        })
    },

    getRecentlyViewedProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
       
            let recentlyViewed = await  db.get().collection(collection.USERS_COLLECTION).aggregate([
                {
                $match:{
                    _id:objectId(userId)
                }
            },
            {
                $project:{recentlyViewed:1}
            },
            {
                $unwind:'$recentlyViewed'
            },
            { 
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                        localField:'recentlyViewed',
                      foreignField:'_id',
                       as:'product'
                }
            },
            {
                $project:{product:{$arrayElemAt:['$product',0]}}
            },
            {
                $sort:{
                    'product':-1
                }
            }
           
        ]).toArray()
            console.log(recentlyViewed)
            resolve(recentlyViewed)
        })
    }

   

     
}







