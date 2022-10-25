var errorName = document.getElementById('bannername')
var errordescription1 = document.getElementById('discription1')
var errordescription2 = document.getElementById('discription2')

function validateBannerName() {
    console.log("hii")
    const name = document.getElementById('BannerName').value;
    console.log(name)
    if (name == "") {
        errorName.innerHTML = 'Enter banner name'
        return false
    }
    if (!name.match(/^[a-zA-Z0-9 ]*$/)) {
        errorName.innerHTML = 'Enter valid banner name'
        return false
    }
     if (name.match(/^[ ]*$/)) {
        errorName.innerHTML = 'Enter banner name'
        return false
    }
    errorName.innerHTML = null
    return true
}

function validateDescription1() {
    const name = document.getElementById('Discription1').value;
    if (name == "") {
        errordescription1.innerHTML = 'Enter description'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errordescription1.innerHTML = 'Enter valid description'
        return false
    }
    errordescription1.innerHTML = null
    return true
}

function validateDescription2() {
    const name = document.getElementById('Discription2').value;
    if (name == "") {
        errordescription2.innerHTML = 'Enter description'
        return false
    }
    
     if (name.match(/^[ ]*$/)) {
        errordescription2.innerHTML = 'Enter valid description'
        return false
    }
    errordescription2.innerHTML = null
    return true
}



function validation() {
    if (!validateBannerName() || !validateDescription1() || !validateDescription2()  ) {
        return false
    }
    return true
}


function viewImage(event){
document.getElementById("imageView").src=URL.createObjectURL(event.target.files[0])
}