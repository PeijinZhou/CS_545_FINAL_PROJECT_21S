const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const xss = require('xss');

router.get("/", async (req, res) => {
    res.render('login/login', {
      title: "Log in"
    });
  })
  router.post("/", async (req, res) => {
  
    let { email, password } = req.body;
    email = xss(email).trim().toLowerCase();
    password = xss(password).trim();
    let error_msgs = [];
    let status = false;
    let user;
    let passwordMatch;
  
      if (!email) {
          error_msgs.push("Must provide valid email.");
      }
  
      if (!password) {
          error_msgs.push("Must provide valid password.")
          }
      if(error_msgs.length === 0){
          let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          if(!emailPattern.test(email)){
                  error_msgs.push("You must provide a valid email.");
              };
          let passwordPattern = /^[\w_-]{3,16}$/;
          if(!passwordPattern.test(password)){
            error_msgs.push("Please provide valid old password.");
            };
      }
      if(error_msgs.length === 0){
          try {
              user = await userData.checkPassword(
                  email, 
                  password
              );

            //for test 
            // const bcrypt = require('bcryptjs');
            // user = await userData.getUserByEmail(email);
            // passwordMatch;
            // if(user){
            //     try {
            //         passwordMatch = await bcrypt.compare(password, user.hashedPassword);
            //     } catch (e) {
            //         console.log(e);
            //     }
            // }
            
          } catch (error) {
              error_msgs.push(error);
          }
      }
      if(error_msgs.length === 0 && user){
          if(user){
            status = "true";
            req.session.user = user["_id"].toString();
          }
      }
  
      res.json({
          status: status,
          error: error_msgs
      });
  });
  
  
  router.get('/validateUserEmail/:userEmail', async (req, res) => {
      let userEmail = xss(req.params.userEmail).trim();
      let status = "true";
      let error;
      let user;
      let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if(!emailPattern.test(userEmail)){
          res.json({
              status: "false",
              error: "Please input valid email address."
          });
          return;
      }
      try {
          user = await userData.getUserByEmail(userEmail);
      } catch (error) {
          console.log(error);
      }
  
      if(!user){
          status = "false";
          error = "We don't have this email in our data base."
      }
      res.json({
          status: status,
          error: error
      });
  });


module.exports = router;

