var express = require("express");
var router = express.Router();
const userHelpers = require("../helpers/user-helpers");
const adminHelpers = require("../helpers/admin-helpers");
const paypal = require('paypal-node-sdk');
const { response } = require("express");
const { ObjectId } = require("mongodb");


async function paginatedResults(req, res, next) {   
    const page = parseInt(req.query.page) 
    const limit =3
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
     
    const results = {}
    let productsCount=await userHelpers.getProductsCount()
    if (endIndex < productsCount) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }
    
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.products = await userHelpers.getPaginatedResult(limit,startIndex) 
      results.pageCount =Math.ceil(parseInt(productsCount)/parseInt(limit)).toString() 
      results.pages =Array.from({length: results.pageCount}, (_, i) => i + 1)    
      results.currentPage =page.toString()
      res.paginatedResults = results  
      next()
  
    } catch (e) {
      res.status(500).json({ message: e.message })
    } 
  }


  const loginCheck = function (req, res, next) {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect("/login");
    }
  };

  const adminLoginCheck=function(req,res,next){
    if(req.session.adminLoggedIn){
      next()
    }else{
      res.redirect('/admin')
    }
  }

  module.exports = {
    paginatedResults,
    loginCheck,
    adminLoginCheck
  }