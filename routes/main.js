const { response } = require('express');
const express = require('express');
const { sortQuestionsByTime, sortQuestionsByAnsNum, getQuestionsByKeywords, getQuestionsByKeywordsAndTopic } = require('../data/questions');
const router = express.Router();
const questions = require('../data/questions');
const { getAllUserVoteList } = require('../data/vote');
const voteData = require('../data/vote')
const xss= require('xss')
router.get('/', async(req,res)=>  {
    res.render("main/mainpage",{
        title: "Main Page"});   
});

router.post('/search', async(req,res)=>{
    let error_msgs = "";
    if(!req.body.keywords){
        error_msgs="Must provide valid keywords to search.";
        let response = {error_msgs}
        res.status(400).json(response)
    }
    else if(!req.body.sort){
        error_msgs="Must provide sort to search.";
        let response = {error_msgs}
        res.status(400).json(response)
    }
    else if(!req.body.topic){
        error_msgs="Must provide topic to search.";
        let response = {error_msgs}
        res.status(400).json(response)
    }
    else if(!req.body.limit){
        error_msgs="Must provide limit number to search."
                let response = {error_msgs}
        res.status(400).json(response)
    }
    else{
        let keywords = xss(req.body.keywords);
        let sort = xss(req.body.sort);
        let topic =xss(req.body.topic);
        let limit =parseInt(xss(req.body.limit));
        let A = [];
        if(sort=="Date from new to old"){
            if(topic=="allTopic"){
                let searchQuestion;
                try{
                    searchQuestion=await getQuestionsByKeywords(keywords);
                }catch (error) {
                    console.log(error);
                }
                
                if(searchQuestion.length==0){
                    A=[];
                }
                else{
                    try{
                        A= await sortQuestionsByTime(searchQuestion,limit);
                    }catch (error) {
                        console.log(error);
                    }
                }
                
                res.json({A});
            }
            else{
                let getQuestion;
                try {
                    getQuestion =await getQuestionsByKeywordsAndTopic(keywords,topic);
                    }catch (error) {
                    console.log(error);
                }
                if(getQuestion.length==0){
                    A=[];
                }
                else{
                    try{
                        A = await sortQuestionsByTime(await getQuestionsByKeywordsAndTopic(keywords,topic),limit);
                    }catch (error) {
                        console.log(error);
                    }
                }
                res.json({A});
            }
        }
        
        else
        {  
            if(topic=="allTopic"){
                if(await getQuestionsByKeywords(keywords).length==0){
                    A=[]
                }
                else{
                    try{
                        A = await sortQuestionsByAnsNum(await getQuestionsByKeywords(keywords),limit);
                    }catch (error) {
                        console.log(error);
                    }
                }
                res.json({A});
            }
            else{
                let searchQuestion;
                try{
                    searchQuestion =await getQuestionsByKeywordsAndTopic(keywords,topic);
                }catch (error) {
                    console.log(error);
                }
                if(searchQuestion.length==0){
                    A =[];
                }
                else{
                    try{
                        A = await sortQuestionsByAnsNum(await getQuestionsByKeywordsAndTopic(keywords,topic),limit);
                    }catch (error) {
                        console.log(error);
                    }
                }
                res.json({A});
            }
        }
    }
    
    // get the name for all question , using loop to return 
})

router.post('/popular',async(req,res)=>{
    if(req.body.ask==true){
        let allQuestionSort;
        try{
            allQuestionSort =await sortQuestionsByAnsNum(await questions.getAllQuestions(), 10)
        }catch (error) {
            console.log(error);
        }

        // get the name for all question , using loop to return 
    
        let A = {returnPopular:allQuestionSort};
        res.json(A);
    }
})

router.post('/honorList',async(req,res)=>{
    if(req.body.honor==true){
        let honorList;
        try{
            honorList = await getAllUserVoteList();
        }catch (error) {
            console.log(error);
        }
        let repsons = {honorList:honorList}
        res.json(repsons)
    }
})

module.exports = router;