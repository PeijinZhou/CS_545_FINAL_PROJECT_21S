const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const xss = require('xss');
const sendEmail = require("../data/email").send;

router.get("/", async (req, res) => {
    res.render('login/reset', {
      title: "Reset Password"
    });
  })
  router.post("/", async (req, res) => {
  
    let { email } = req.body;
    email = xss(email).trim().toLowerCase();
    let error_msgs = [];
    let status = false;
    const newPassword = "abcd1234";
    let user;
  
      if (!email) {
          error_msgs.push("Must provide valid email.");
      }
  
      if(error_msgs.length === 0){
          let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          if(!emailPattern.test(email)){
                  error_msgs.push("You must provide a valid email.");
              }
      }
      if(error_msgs.length === 0){
          try {
            user = await userData.getUserByEmail(email);
          } catch (error) {
            error_msgs.push(error.message);
          }

          if(user){
              try {
                user =  await userData.setPassword(user["_id"].toString(), newPassword);
              } catch (error) {
                error_msgs.push(error.message);
              }
          }
      }
      if(error_msgs.length === 0){
          status = "true";
          if(user){

            let userName = user["userName"];
            let userEmail = user["email"];
            let subject = `Hi ${userName}, Your password has been reset to ${newPassword}.`;
            let text = `Hi ${userName},\n Your password has been reset to ${newPassword}.\n thanks.`;
            try {
                await sendEmail(userEmail, subject, text);
            } catch (error) {
                console.log(error);
            }
          }
      }
  
      res.json({
          status: status,
          error: error_msgs
      });
  });
  
  
  router.get('/validateUserEmail/:userEmail', async (req, res) => {
      let userEmail = xss(req.params.userEmail);
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

