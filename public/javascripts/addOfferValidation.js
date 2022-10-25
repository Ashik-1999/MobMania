var errorOffer = document.getElementById('Offer')
var errorDate = document.getElementById('Date')

function validateOffer() {
    
    const name = document.getElementById('offer').value;
    
    if (name == "") {
        errorOffer.innerHTML = 'Enter offer'
        return false
    }
    if (name <0 || name>40) {
        errorOffer.innerHTML = 'Enter valid offer'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errorOffer.innerHTML = 'Enter valid offer'
        return false
    }
    errorOffer.innerHTML = null
    return true
}

function validateDate() {
    
    const name = document.getElementById('date').value;
    
    if (name == "") {
        errorDate.innerHTML = 'Enter date'
        return false
    }
    
     if (name.match(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)) {
        errorDate.innerHTML = 'Enter valid date'
        return false
    }
    errorDate.innerHTML = null
    return true
}





function validation() {
    if (!validateOffer() ||!validateDate() ) {
        return false
    }
    return true
}
      function viewImg(event){
         document.getElementById("imgView").src=URL.createObjectURL(event.target.files[0])
    }