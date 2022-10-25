var errorCode = document.getElementById('Code')

var errordescription = document.getElementById('Discription')
var errordiscount = document.getElementById('Discount')
var errordate = document.getElementById('Date')

function validateCouponCode() {
    
    const name = document.getElementById('code').value;
    console.log(name)
    if (name == "") {
        errorCode.innerHTML = 'Enter Coupon Code'
        return false
    }
    if (!name.match(/^[a-zA-Z0-9 ]*$/)) {
        errorCode.innerHTML = 'Enter valid Coupon Code'
        return false
    }
     if (name.match(/^[ ]*$/)) {
        errorCode.innerHTML = 'Enter Coupon Code'
        return false
    }
    errorCode.innerHTML = null
    return true
}

function validateDiscription() {
    const name = document.getElementById('discription').value;
    if (name == "") {
        errordescription.innerHTML = 'Enter description'
        return false
    }
    if (!name.match(/^[a-zA-Z ]*$/)) {
        errordescription.innerHTML = 'Enter valid discription'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errordescription.innerHTML = 'Enter valid description'
        return false
    }
    errordescription.innerHTML = null
    return true
}

function validateDiscount() {
    const name = document.getElementById('discount').value;
    if (name == "") {
        errordiscount.innerHTML = 'Enter discount'
        return false
    }
    if (name <0 || name>30) {
        errordiscount.innerHTML = 'Enter valid discount'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errordiscount.innerHTML = 'Enter valid description'
        return false
    }
    errordiscount.innerHTML = null
    return true
}

function validateDate() {
    const name = document.getElementById('date').value;
    if (name == "") {
        errordate.innerHTML = 'Enter date'
        return false
    }
    
     if (name.match(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)) {
        errordate.innerHTML = 'Enter valid date'
        return false
    }
    errordate.innerHTML = null
    return true
}



function validation() {
    if (!validateCouponCode() || !validateDiscription() || !validateDiscount() || !validateDate() ) {
        return false
    }
    return true
}


function viewImage(event){
document.getElementById("imageView").src=URL.createObjectURL(event.target.files[0])
}