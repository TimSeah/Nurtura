const express = require('express');
const router = express.Router();


//DEPRECATED, NO LONGER USING AUTH
//import auth from @clerk/express
//const {requireAuth} = require('@clerk/express'); 

// Applies authentication check to entire router
// from this line onwards, all routes in this file 
// require user to be authenticated
//router.use(requireAuth());



/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the Project API!' });
});

module.exports = router;