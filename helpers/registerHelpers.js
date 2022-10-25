

var objectId=require('mongodb').ObjectId

module.exports={



        ifEquals:(value1,value2,options)=>{
    
    
          if(value1==value2){
             
             return options.fn()
          }else{
              
              return options.inverse();   
          }
      },
    
        wishlistHeartIcon:(productId,wishlistArray,options)=>{
            console.log(productId,wishlistArray,"ppppuuuccc")
          if(wishlistArray){
              function doesAnyWishlistIdMatch(wishlistProducts){
                
             
    
                  return productId.toString() == wishlistProducts.products.toString()
              }
              if(wishlistArray.some(doesAnyWishlistIdMatch)){
                  return options.fn()
              }else{
                  return options.inverse();   
              }
          }else{
              return options.inverse();   
          }
          
      },
    
      indexing:(index)=>{
          return index+1;
      },
    
    
      goToCart:(proId,userId,cartData,options)=>{

        

       
        if(userId && cartData){
          
            
             let booleanCheck = cartData.products.some((element)=>{
            
                return element.item.toString() == proId.toString()
             })

             
    
             if(booleanCheck){
             
              return options.fn()
             }else{
              return options.inverse();   
             }
           
         }else{
           return options.inverse();   
          }
      },

      checkPaymentMethod:(paymentMethod,options)=>{
        if(!(paymentMethod=="COD")){
            return options.fn()
        }else{
            return options.inverse();
        }
      }
    }
