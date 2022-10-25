
var errorName = document.getElementById('name')
var errordescription = document.getElementById('productdescription')
var errorCategory = document.getElementById('category')
var errorColor = document.getElementById('Color') 
var errorPrice = document.getElementById('Price')
var errorStock = document.getElementById('Stock')
var errorSpec = document.getElementById('Specifications')
var errorOffers = document.getElementById('Offers')
var errorBrand = document.getElementById('Brand')
var errorCategory = document.getElementById('Category')
function validateProductName() {
    const name = document.getElementById('Name').value;
    if (name == "") {
        errorName.innerHTML = 'Enter product name'
        return false
    }
    if (!name.match(/^[a-zA-Z0-9 ]*$/)) {
        errorName.innerHTML = 'Enter valid Product name'
        return false
    }
     if (name.match(/^[ ]*$/)) {
        errorName.innerHTML = 'Enter product name'
        return false
    }
    errorName.innerHTML = null
    return true
}

function validateProductDescription() {
    const name = document.getElementById('Discription').value;
    if (name == "") {
        errordescription.innerHTML = 'Enter description'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errordescription.innerHTML = 'Enter valid description'
        return false
    }if (name.length < 10) {
        
       errordescription.innerHTML = "enter valid description "
        return false
    }
    errordescription.innerHTML = null
    return true
}
function validCategory() {
    const category = document.getElementById('Category').value
    if (category == "") {
        errorCategory.innerHTML = "Enter category"
        return false
    }
    errorCategory.innerHTML = null
    return true
}

function validOffers() {
    const offers = document.getElementById('offers').value
    if (offers == "") {
        errorOffers.innerHTML = "Enter offers"
        return false
    }
    if(offers>40||offers<10){
      errorOffers.innerHTML="Please enter a valid Offer"
      return false
    }else{
        errorOffers.innerHTML = null
    return true
    }
}
    

function validColor() {
    const color = document.getElementById('color').value
    if (color == "") {
        errorColor.innerHTML = "Enter color"
        return false
    }
    if (!color.match(/^[a-zA-Z ]*$/)) {
        errorColor.innerHTML = "Enter valid color"
        return false
    }
    errorColor.innerHTML = null
    return true
}
 function validPrice() {
    const price = document.getElementById('price').value
    if (price == "") {
        errorPrice.innerHTML = "Enter the price"
        return false
    }
    errorPrice.innerHTML = null
    return true
}
  function validStock() {
    const stock = document.getElementById('stock').value
    if (stock == "") {
        errorStock.innerHTML = "Enter the stock"
        return false
    }
    errorStock.innerHTML = null
    return true
}

function validateSpecs() {
    const name = document.getElementById('specs').value;
    if (name == "") {
        errorSpec.innerHTML = 'Enter specifications'
        return false
    }
  
     if (name.match(/^[ ]*$/)) {
        errorSpec.innerHTML = 'Enter valid specifications'
        return false
    }
    errorSpec.innerHTML = null
    return true
}

function validBrand() {
    const brand = document.getElementById('brand').value
    if (brand == "") {
        errorBrand.innerHTML = "*"
        return false
    }
    errorBrand.innerHTML = null
    return true
}

function validCategory() {
    const category = document.getElementById('category').value
    if (category == "") {
        errorCategory.innerHTML = "*"
        return false
    }
    errorCategory.innerHTML = null
    return true
}


function validation() {
    if (!validateProductName() || !validCategory() || !validBrand() || !validateProductDescription() || !validCategory() || !validColor() || !validPrice() ||!validStock() ||!validateSpecs() ||!validOffers() ) {
        return false
    }
    return true
}


function viewImage(event){
document.getElementById("imageView").src=URL.createObjectURL(event.target.files[0])
}
