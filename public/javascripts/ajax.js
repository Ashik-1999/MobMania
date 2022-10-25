
/* <--------------------------------------------------------AJAx for change quantity in cart------------------------------------------------------------> */
		function changeQuantity(cartId,proId,userId,count){
			let quantity=parseInt(document.getElementById(proId).innerHTML)
			let total=parseInt(document.getElementById(proId+"total").innerHTML)
			let prodtotal=parseInt(document.getElementById(proId+"price").innerHTML)
			
			$.ajax({
				url:'/changeProductQuantity',
				data:{
					
					cart:cartId,
					product:proId,
					count:count,
					quantity:quantity,
					user:userId
				},
				method:'post',
				success:(response)=>{
					if(response.decLimit){
						document.getElementById(proId+"decrement").style.display="none"
					 alert("select atleast one quantity or remove item")
					// document.getElementById("stockMessage").innerHTML="select atleast one quantity or remove item"
						
					}
					else{

						if(response.outOfStockErr){
							document.getElementById(proId+"increment").style.display="none"
							document.getElementById(proId+"stockMessage").innerHTML="Out of stock"
							// alert("product is out of stock")
						}else{
						document.getElementById(proId+"increment").style.display="inline"
						document.getElementById(proId+"decrement").style.display="inline"
						document.getElementById(proId+"stockMessage").innerHTML=""
						


						document.getElementById(proId).innerHTML=quantity+count
						document.getElementById(proId + "total").innerHTML=document.getElementById(proId).innerHTML*prodtotal
						
						if(response.couponOffer[0].discountedPrice){
							document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
							document.getElementById('coupon-price').innerHTML=response.couponOffer[0].discountedPrice
							
							document.getElementById('Grandtotal').innerHTML=document.getElementById('subtotal').innerHTML-response.couponOffer[0].discountedPrice
						}else{
							document.getElementById('Grandtotal').innerHTML=response.total[0].totalAmount
							document.getElementById('subtotal').innerHTML=response.total[0].totalAmount
						}
						


						}	
						

						
						
					}
				}
			})
		}


/* <------------------------------------------------AJAX for remove products form cart--------------------------------------------------------------------> */



        function removeProduct(proId,cartId){

			if(confirm("are you sure?")){
			
				$.ajax({
					url:'/deleteProduct',
					data:{
						product:proId,
						cart:cartId
					},
					method:'post',
					success:(response)=>{
						
						alert("item is deleted")
						location.reload()
	
					}
				})
			}

		}



/* <-----------------------------------------------------AJAX for checkout--------------------------------------------------------------> */


       


/* <--------------------------------------------------AJAX for status update for order in admin------------------------------------------------------------------> */


    // function updateStatus(orderId,proId){

    //       let	status=document.getElementById('inputGroupSelect04'+proId).value
    //       console.log(status)
    //       console.log(orderId,proId)
    //       $.ajax({
    //         url:'/admin/order-status-update',
    //         data:{
              
    //           orderId:orderId,
    //           proId:proId,
	// 		  status:status
    //         },
    //         method:'post',
    //         success:()=>{
              
    //           location.reload()
    //         }

    //       })
    //       }


		  








/* <---------------------------------------------------------AJAX for cancel the order in user-------------------------------------------------------------------------> */

function userCancelOrder(orderId,proId,quantity){
		
	let status = "cancelled"
	   

	   $.ajax({
		   url:'/cancelorder',
		   data:{
			   status:status,
			   orderId:orderId,
			   proId:proId,
			   quantity:quantity
		   },
		   method:'post',
		   success:()=>{	
				location.reload()
				
		   }

   })
	
}
	


/* <-------------------------------------------------------------AJAX for add to wishlist-------------------------------------------------------> */


function addToWishlist(prodId){

	
	
	$.ajax({
		url:'/addToWishlist',
		data:{
			product:prodId,
			
		},
		method:'post',
		success:(response)=>{
			if(response.login){
	
				
				document.getElementById('heartIcon'+prodId).style.color='rgb(0, 115, 255)'
				
			}else{
				location.href='/login'
			}
			

		}
	})
}




/* <-------------------------------------------------------------AJAX for delete products from wishlist-------------------------------------------------------> */




function removeWishlistProduct(proId,wishlistId){
	if(confirm("are you sure?")){
		
		$.ajax({
			url:'/delete-wishlist-product',
			data:{
				product:proId,
				wishlist:wishlistId
			},
			method:'post',
			success:(response)=>{
				
				alert("item is deleted")
				location.reload()
	
			}
		})
	}
	
}





function changeAddress (Customer,Housename){
    
    $.ajax({
        url:'/getorderaddress',
        data:{
			cusName:Customer,
			cusHouseName:Housename
        },
        method:'post',
        success:(address)=>{
            console.log(address)
			
             document.getElementById('fullname').value = address[0]._id.customerName;
             document.getElementById('address').value = address[0]._id.address.HouseName;
             document.getElementById('streetname').value = address[0]._id.address.streetName;
             document.getElementById('landmark').value = address[0]._id.address.landmark;
             document.getElementById('city').value = address[0]._id.address.city;
             document.getElementById('state').value = address[0]._id.address.state;
             document.getElementById('pincode').value = address[0]._id.address.pincode;
             document.getElementById('number').value = address[0]._id.mobile;
             document.getElementById('email').value = address[0]._id.email;
    }
    }) 
    
}



function deleteAddress (Customer,Housename){
   if(confirm("Are you sure")){
	$.ajax({
        url:'/addressDelete',
        data:{
			cusName:Customer,
			cusHouseName:Housename
        },
        method:'post',
        success:(response)=>{
            
				document.getElementById(Housename + "address").style.display="none"
			
			

    }
    }) 
   }
    
    
}



function recentlyViewed(prodId){
	
	$.ajax({
		url:'/recently-viewed',
		data:{
			prodId:prodId
		},
		type:'POST',
		success:()=>{
			alert('haii')
		}
	})
}






















