const { response } = require('express');
const express = require('express');
const router = express.Router();
const xss= require('xss')

router.get('/', async(req,res)=>  {
    res.render("main/helpPage",{
        title: "help Page"});   
});

module.exports = router;