/*
router for information page
in delievry version, this file should not have code directly operate database
author: Wu Haodong
date: 2020-11-13 16:01:40
*/
const express = require('express');
const xss = require('xss');
const router = express.Router();
const usersData = require('../data/users');
const questionsData = require('../data/questions');
const reviewsData = require("../data/reviews");
const answersData = require("../data/answers");
const email = require("../data/email").send;

router.get('/', async(req,res) => {
    const userId = xss(req.session.user).trim();
    let user;
    if(!userId){
        res.redirect("/");
    }
    try {
        user = await usersData.getUserById(userId);
    } catch (error) {
        console.log(error);
        res.redirect("/");
    }
    if(!user){
        res.redirect("/");
    }

    let userName = user["userName"];
    let userEmail = user["email"];
    let userRegistDate = user["dateSignedIn"];
    let userAnswers = user["answers"];
    let userReviews = user["reviews"]
    //get score

    let userGetVote = 0;
    for(let j=0;j<userAnswers.length;j++){
        let userEachAnswer;
        try {
            userEachAnswer=await answersData.getAnswerById(userAnswers[j]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        if(userEachAnswer){
            userGetVote += userEachAnswer.voteUp.length-userEachAnswer.voteDown.length;
        }
    }

    for(let l=0;l<userReviews.length;l++){
        let userEachReview;
        try {
            userEachReview = await reviewsData.getReviewById(userReviews[l]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        userGetVote += userEachReview.voteUp.length-userEachReview.voteDown.length;
    }

    
    res.render("user/user",{
        title: "Personal Information",
        userName: userName,
        userEmail: userEmail,
        userRegistDate: new Date(userRegistDate).toDateString(),
        userScore: userGetVote
    })
    return;
});
router.post('/changePassword', async(req,res) => {
    let newPassword = xss(req.body.newPassword).trim();
    let oldPassword = xss(req.body.oldPassword).trim();
    let user;
    let status = true;
    let message;
    const userid = xss(req.session.user)
    if(!newPassword){
        status = false;
        message = "Please provide new password.";
    }
    if(!oldPassword){
        status = false;
        message = "Please provide old password.";
    }
    let passwordPattern = /^[\w_-]{3,16}$/;
    if(!passwordPattern.test(oldPassword)){
        status = false;
        message = "Please provide valid old password.";
    }
    if(!passwordPattern.test(newPassword)){
        status = false;
        message = "Please provide valid new password.";
    }

    if(status){
        try {
            user = await usersData.getUserById(userid);
        } catch (error) {
            status = false;
            message = error.message;
            
        }
    }
    
    if(user && status){
        
        try {
            user = await usersData.changPassword(user["_id"].toString(), oldPassword, newPassword);
        } catch (error) {
            status = false;
            message = error;
        }
        if(user && status){
            let userEmail = user["email"];
            let userName = user["userName"];
            
            let subject = `Hi ${userName}, Your password has been changed to ${newPassword}.`;
            let text = `Hi ${userName},\n Your password has been changed to ${newPassword}.`;
            try {
                await email(userEmail, subject, text);
            } catch (error) {
                status = false;
                message = error.message;
            }
        }
        
    }
    
    
    res.json ({
        status: status,
        message: message
    });
    

});

router.post('/getFollowedQuestions', async(req,res) => {
    let limit = parseInt(xss(req.body.limit));
    let sort = xss(req.body.sort);
    let user;
    const userid = xss(req.session.user)
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(error);
    }
    let userFollowedQuestions = user["followedQuestions"];
    let userFollowedQuestionsObjectsList = [];
    let userFollowedQuestionsList = [];
    for(let i = 0; i < userFollowedQuestions.length; i++)
    {
        let question;
        try {
            question = await questionsData.getQuestionById(userFollowedQuestions[i]);
        } catch (error) {
            console.log(error);
            continue;
        }
        userFollowedQuestionsObjectsList.push(question);
    }
    if(userFollowedQuestionsObjectsList.length != 0){
        if(sort === "Answers number from high to low"){
            try {
                userFollowedQuestionsObjectsList = await questionsData.sortQuestionsByAnsNum(userFollowedQuestionsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
        else{
            try {
                userFollowedQuestionsObjectsList = await questionsData.sortQuestionsByTime(userFollowedQuestionsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
    }
    
    for(let i = 0; i < userFollowedQuestionsObjectsList.length; i++)
    {
        let question = userFollowedQuestionsObjectsList[i];
        let questionName = question["content"];
        let questionUrl = `question/${question["_id"]}`;
        let createdAt = new Date(question["questionCreatedTime"]).toDateString();

        userFollowedQuestionsList.push({
            questionId: question._id.toString(),
            questionName: questionName,
            questionUrl: questionUrl,
            numberOfAnswers: question["answers"].length,
            createdAt: createdAt

        });
    }
    res.json({
        userFollowedQuestionsList:userFollowedQuestionsList
    });

});
router.post('/followQuestion', async(req,res) => {
    const userId = xss(req.session.user).trim();
    let questionId = xss(req.body.questionId).trim();
    let followedStatus = true; 
    let followedCheck;
    let followedError;
    try {
        followedCheck = await usersData.followQuestionCheck(userId, questionId);
    } catch (error) {
        followedError = error;
        followedStatus = false;
    }
    if(followedStatus && followedCheck)
    {
        followedError = "You have already followed the question.";
        followedStatus = false;
    }
    if(followedStatus){
        try {
            await usersData.followQuestion(userId, questionId);
        } catch (error) {
            followedError = error;
            followedStatus = false;
        }
    }

    res.json({
        status: followedStatus,
        error: followedError
    });
});

router.post('/unfollowQuestion', async(req,res) => {
    const userId = xss(req.session.user).trim();
    let questionId = xss(req.body.questionId).trim();
    let unfollowedStatus = true; 
    let unfollowedCheck;
    let unfollowedError;
    try {
        unfollowedCheck = !await usersData.followQuestionCheck(userId, questionId);
    } catch (error) {
        unfollowedError = error;
        unfollowedStatus = false;
    }
    if(unfollowedStatus && unfollowedCheck)
    {
        unfollowedError = "You have not followed the question.";
        unfollowedStatus = false;
    }
    if(unfollowedStatus){
        try {
            deletedStatus = await usersData.unfollowQuestion(userId, questionId);
        } catch (error) {
            unfollowedError = error;
            unfollowedStatus = false;
        }
    }

    res.json({
        status: unfollowedStatus,
        error: unfollowedError
    });
});

router.post('/getQuestions', async(req,res) => {
    let limit = parseInt(xss(req.body.limit));
    let sort = xss(req.body.sort);
    let user;
    const userid = xss(req.session.user)
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(user);
    }
    
    let userQuestions = user["questions"];
    let userQuestionsObjectsList = [];
    let userQuestionsList = [];
    for(let i = 0; i < userQuestions.length; i++)
    {
        let question;
        try {
            question = await questionsData.getQuestionById(userQuestions[i]);
        } catch (error) {
            console.log(error);
            continue;
        }
        userQuestionsObjectsList.push(question);
    }
    if(userQuestionsObjectsList.length != 0){
        if(sort === "Answers number from high to low"){
            try {
                userQuestionsObjectsList = await questionsData.sortQuestionsByAnsNum(userQuestionsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
        else{
            try {
                userQuestionsObjectsList = await questionsData.sortQuestionsByTime(userQuestionsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
    }
    
    for(let i = 0; i < userQuestionsObjectsList.length; i++)
    {
        let question = userQuestionsObjectsList[i];
        let questionName = question["content"];
        let questionUrl = `question/${question["_id"]}`;
        let createdAt = new Date(question["questionCreatedTime"]).toDateString();

        userQuestionsList.push({
            questionId: question._id.toString(),
            questionName: questionName,
            questionUrl: questionUrl,
            numberOfAnswers: question["answers"].length,
            createdAt: createdAt

        });
    }
    res.json({
        userQuestionsList:userQuestionsList
    });

});
router.post('/deleteQuestion', async(req,res) => {
    let id = xss(req.body.questionId).trim();
    let deletedStatus; 
    try {
        deletedStatus = await questionsData.removeQuestion(id);
    } catch (error) {
        console.log(error);
    }
   
    res.json({
        status: true
    });
});

router.post('/getAnswers', async(req,res) => {
    let limit = parseInt(xss(req.body.limit));
    let sort = xss(req.body.sort);
    const userid = xss(req.session.user);
    let user;
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(error);
    }
    let userAnswers
    if(user){
        userAnswers = user["answers"];
    }
    let userAnswersObjectsList = [];
    let userAnswersList = [];
    for(let i = 0; i < userAnswers.length; i++)
    {
        let answer;
        try {
            answer = await answersData.getAnswerById(userAnswers[i]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        userAnswersObjectsList.push(answer);
    }
    if(userAnswersObjectsList.length != 0){
        if(sort === "Voted score from high to low"){
            try {
                userAnswersObjectsList = await answersData.sortAnswersByVote
    (userAnswersObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
        else{
            try {
                userAnswersObjectsList = await answersData.sortAnswersByTime(userAnswersObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
           
        }
    }
    
    
    for(let i = 0; i < userAnswersObjectsList.length; i++)
    {
        let answer = userAnswersObjectsList[i];
        let answerQuestion;
        try {
            answerQuestion = await questionsData.getQuestionById(answer["questionId"])
        } catch (error) {
            console.log(error);
            continue;
        }
        
        let answerQuestionName = answerQuestion["content"];
        let answerQuestionUrl = `question/${answerQuestion["_id"]}`;
        let recentUpdatedTime
        = new Date(answer["recentUpdatedTime"]).toDateString();
        let answerReviews = [];
        for(let j = 0; j < answer["reviews"].length; j++){
            let review;
            try {
                review = await reviewsData.getReviewById(answer["reviews"][j]);
            answerReviews.push(review["content"]);
            } catch (error) {
                console.log(error);
                continue;
            }
            
        }
        userAnswersList.push({
            answerId: answer._id.toString(),
            questionName: answerQuestionName,
            questionUrl: answerQuestionUrl,
            answerContent: answer["content"],
            numberOfVoteUp: answer["voteUp"].length,
            numberOfVoteDown: answer["voteDown"].length,
            reviews: answerReviews,
            recentUpdatedTime: recentUpdatedTime

        });
    }
    res.json({
        userAnswersList:userAnswersList
    });

});
router.post('/deleteAnswer', async(req,res) => {
    const id = xss(req.body.answerId);
    let deletedStatus;
    let answer;
    try {
        answer = await answersData.getAnswerById(id);
    } catch (error) {
        console.log(error);
    }
    
    try {
        deletedStatus = await answersData.removeAnswer(id, answer["answerer"], answer["questionId"]);
    } catch (error) {
        console.log(error);
    }

    res.json({
        status: true
    });
});

router.post('/getReviews', async(req,res) => {
    const limit = parseInt(xss(req.body.limit));
    const sort = xss(req.body.sort);
    const userid = xss(req.session.user)
    
    let user;
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(error);
    }
    
    let userReviews = user["reviews"];
    let userReviewsObjectsList = [];
    let userReviewsList = [];
    for(let i = 0; i < userReviews.length; i++)
    {
        let review;
        try {
            review = await reviewsData.getReviewById(userReviews[i]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        if(review === null) continue;
        userReviewsObjectsList.push(review);
    }
    if(userReviewsObjectsList.length != 0){
        if(sort === "Voted score from high to low"){
            try {
                userReviewsObjectsList = await reviewsData.sortReviewsByVote
    (userReviewsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
        else{
            try {
                userReviewsObjectsList = await reviewsData.sortReviewsByTime(userReviewsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
        }
    }
    
    for(let i = 0; i < userReviewsObjectsList.length; i++)
    {
        let review = userReviewsObjectsList[i];
        let reviewAnswer 
        try {
            reviewAnswer = await answersData.getAnswerById(review["answerId"]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        let reviewQuestion 
        try {
            reviewQuestion = await questionsData.getQuestionById(reviewAnswer["questionId"]);
        } catch (error) {
            console.log(error);
            continue;
        }
        
        let reviewQuestionName = reviewQuestion["content"];
        let reviewQuestionUrl = `question/${reviewQuestion["_id"]}`;
        let recentUpdatedTime
        = new Date(review["recentUpdatedTime"]).toDateString();

        userReviewsList.push({
            reviewId: review._id.toString(),
            questionName: reviewQuestionName,
            questionUrl: reviewQuestionUrl,
            answerContent: reviewAnswer["content"],
            reviewContent: review["content"],
            numberOfVoteUp: review["voteUp"].length,
            numberOfVoteDown: review["voteDown"].length,
            recentUpdatedTime: recentUpdatedTime

        });
    }
    res.json({
        userReviewsList:userReviewsList
    });

});
router.post('/deleteReview', async(req,res) => {
    const id = xss(req.body.reviewId);
    let deletedStatus;
    let review;
    let answer;
    try {
        review = await reviewsData.getReviewById(id);
    } catch (error) {
        console.log(error);
    }

    try {
        answer = await answersData.getAnswerById(review["answerId"]);
    } catch (error) {
        console.log(error);
    }
    
    try {
        deletedStatus = await reviewsData.removeReview(id, review["reviewer"], answer["_id"].toString(), answer["questionId"]);
    } catch (error) {
        console.log(error);
    }
    res.json({
        status: true
    });
});

// voted Answers
router.post('/getVotedAnswers', async(req,res) => {
    let limit = parseInt(xss(req.body.limit));
    let sort = xss(req.body.sort);
    const userid = xss(req.session.user)
    let user;
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(error);
    }
    
    let userVotedAnswers = user["votedForAnswers"];
    let userVotedAnswersObjectsList = [];
    let userVotedAnswersList = [];
    for(let i = 0; i < userVotedAnswers.length; i++)
    {
        let votedAnswer 
        try {
            votedAnswer = await answersData.getAnswerById(userVotedAnswers[i]);

        } catch (error) {
            console.log(error);
            continue;
        }
        
        if(votedAnswer === null) continue;
        userVotedAnswersObjectsList.push(votedAnswer);
    }
    //Voted score of the answer from high to low
    if(userVotedAnswersObjectsList.length != 0){
        if(sort.split(" ")[0] === "Voted"){
            try {
                userVotedAnswersObjectsList = await answersData.sortAnswersByVote
    (userVotedAnswersObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
    
        }
        else{
            try {
                userVotedAnswersObjectsList = await answersData.sortAnswersByTime(userVotedAnswersObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
            
        }
    }
    
    
    for(let i = 0; i < userVotedAnswersObjectsList.length; i++)
    {
        let votedAnswer = userVotedAnswersObjectsList[i];
        let votedAnswerQuestion;
        try {
            votedAnswerQuestion = await questionsData.getQuestionById(votedAnswer["questionId"]);
        } catch (error) {
            console.log(error);
            continue;
        }
        let votedAnswerQuestionName = votedAnswerQuestion["content"];
        let votedAnswerQuestionUrl = `question/${votedAnswerQuestion["_id"]}`;
        let recentUpdatedTime
        = new Date(votedAnswer["recentUpdatedTime"]).toDateString();
        let IsVoteUp = false;
        if(votedAnswer["voteUp"].indexOf(user["_id"].toString()) != -1){
            IsVoteUp = true;
        }
        // let IsVoteUp = await answersData.judgeVoteUpInAnswers(user["_id"].toString());

        userVotedAnswersList.push({
            votedAnswerId: votedAnswer._id.toString(),
            VotedAnswerUserId: user["_id"].toString(),
            questionName: votedAnswerQuestionName,
            questionUrl: votedAnswerQuestionUrl,
            answerContent: votedAnswer["content"],
            numberOfVoteUp: votedAnswer["voteUp"].length,
            numberOfVoteDown: votedAnswer["voteDown"].length,
            recentUpdatedTime: recentUpdatedTime,
            IsVoteUp:IsVoteUp

        });
    }
    res.json({
        userVotedAnswersList:userVotedAnswersList
    });

});
router.post('/updateVoteAnswer', async(req,res) => {
    const answerId = xss(req.body.answerId);
    const userId = xss(req.body.userId);
    const goal = xss(req.body.goal);

    let updatedStatus 
    if(goal === "voteUp"){
        try {
            updatedStatus= await answersData.updateVoteUp(answerId, userId);
        } catch (error) {
            console.log(error);
        }
        
    }else{
        try {
            updatedStatus= await answersData.updateVoteDown(answerId, userId);
        } catch (error) {
            console.log(error);
        }
    }

    res.json({
        status: true
    });
});

//voted reviews
router.post('/getVotedReviews', async(req,res) => {
    let limit = parseInt(xss(req.body.limit));
    let sort = xss(req.body.sort);

    const userid = xss(req.session.user)
    let user;
    try {
        user = await usersData.getUserById(userid);
    } catch (error) {
        console.log(error);
    }
    let userVotedReviews = user["votedForReviews"];
    let userVotedReviewsObjectsList = [];
    let userVotedReviewsList = [];
    for(let i = 0; i < userVotedReviews.length; i++)
    {
        let votedReview;
        try {
            votedReview = await reviewsData.getReviewById(userVotedReviews[i]);
        } catch (error) {
            console.log(error);
            continue;
        }
        if(votedReview === null) continue;
        userVotedReviewsObjectsList.push(votedReview);
    }
    //Voted score of the review from high to low
    if(userVotedReviewsObjectsList.length != 0){
        if(sort.split(" ")[0] === "Voted"){
            try {
                userVotedReviewsObjectsList = await reviewsData.sortReviewsByVote
    (userVotedReviewsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
        }
        else{
            try {
                userVotedReviewsObjectsList = await reviewsData.sortReviewsByTime(userVotedReviewsObjectsList, limit);
            } catch (error) {
                console.log(error);
            }
            
            
        }
    }
    
    for(let i = 0; i < userVotedReviewsObjectsList.length; i++)
    {
        let votedReview = userVotedReviewsObjectsList[i];
        let votedReviewAnswer;
        try {
            votedReviewAnswer = await answersData.getAnswerById(votedReview["answerId"]);
        } catch (error) {
            console.log(error);
            continue;
        }
        let votedReviewAnswerQuestion;
        try {
            votedReviewAnswerQuestion = await questionsData.getQuestionById(votedReviewAnswer["questionId"]);
        } catch (error) {
            console.log(error);
            continue;
        }
        

        let votedReviewAnswerQuestionName = votedReviewAnswerQuestion["content"];
        let votedReviewAnswerQuestionUrl = `question/${votedReviewAnswerQuestion["_id"]}`;
        let recentUpdatedTime
        = new Date(votedReview["recentUpdatedTime"]).toDateString();
        let IsVoteUp = false;
        if(votedReview["voteUp"].indexOf(user["_id"].toString()) != -1){
            IsVoteUp = true;
        }
        // let IsVoteUp = await answersData.judgeVoteUpInAnswers(user["_id"].toString());

        userVotedReviewsList.push({
            votedReviewId: votedReview._id.toString(),
            VotedReviewUserId: user["_id"].toString(),
            questionName: votedReviewAnswerQuestionName,
            questionUrl: votedReviewAnswerQuestionUrl,
            answerContent: votedReviewAnswer["content"],
            reviewContent: votedReview["content"],
            numberOfVoteUp: votedReview["voteUp"].length,
            numberOfVoteDown: votedReview["voteDown"].length,
            recentUpdatedTime: recentUpdatedTime,
            IsVoteUp:IsVoteUp

        });
    }
    res.json({
        userVotedReviewsList:userVotedReviewsList
    });

});
router.post('/updateVoteReview', async(req,res) => {
    const reviewId = xss(req.body.reviewId);
    const userId = xss(req.body.userId);
    const goal = xss(req.body.goal);

    let updatedStatus;
    if(goal === "voteUp"){
        try {
            updatedStatus= await reviewsData.updateVoteUp(reviewId, userId);
        } catch (error) {
            console.log(error);
        }
        
    }else{
        try {
            updatedStatus= await reviewsData.updateVoteDown(reviewId, userId);
        } catch (error) {
            console.log(error);
        }
    }
    res.json({
        status: true
    });
});

router.get('/getUserStatus', async(req,res) => {
    const userId = xss(req.session.user);
    let user;
    if(userId === undefined || userId == ''){
        res.json({
            status: false
        });
        return;
    }
    try {
        user = await usersData.getUserById(userId);
    } catch (error) {
        res.json({
            status: false
        });
        console.log(error);
        return;
    }
   

    res.json({
        status: true,
        userName: user["userName"]
    });
});
module.exports = router;