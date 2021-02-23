const express = require('express');
const router = express.Router();
const data = require('../data');
const answerDate = data.answers;
const questionsData = data.questions;
const userData = data.users;
const reviewDate = data.reviews;
const session = require('express-session');
const { ObjectId } = require('mongodb');
const xss = require('xss');
const { unfollowQuestion } = require('../data/users');

/**
 * get all info of the question
 * 1.   user
 * 2.   questionContent: question.content
 * 3.   answersInQuestion[]: question.answers
 * 4.   reviewsInAnswers[][]: answersanswers
 *  question={
 *  questionObj:
 *  answers :[{
 *      answerId:
 *      reviews:[{
 * }]
 * }]
 * }
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = xss(req.session.user)
        // userId = "5fd82a4799eb7c385db27e09"
        if(!userId){
            res.redirect("/login")
        }
        const id = xss(req.params.id)
        const question = await questionsData.getQuestionById(id)
        // const questionContent = question.content
        const answersId = question.answers
        const isFollowed= await userData.followQuestionCheck(userId,id)

        let answersInQuestion = new Array()     //obj array 
        for (let index = 0; index < answersId.length; index++) {
            let curReviewsInAnswers = new Array()
            let curAnswerId = answersId[index];
            let curAnswer = await answerDate.getAnswerById(curAnswerId)
            let curReviewIdArray = curAnswer.reviews
            for (let j = 0; j < curReviewIdArray.length; j++) {
                let curReviewId = curReviewIdArray[j];
                let curReview = await reviewDate.getReviewById(curReviewId)
                curReview.reviewId = curReviewId
                curReview.oldData=curReview.recentUpdatedTime
                curReview.recentUpdatedTime = await answerDate.transferData(curReview.recentUpdatedTime)
                curReview.voteUpNumber = curReview.voteUp.length
                curReview.voteDownNumber = curReview.voteDown.length
                curReview.voteUpJudge = await reviewDate.judgeVoteUpInReviews(userId, curReviewId)
                curReview.voteDownJudge = await reviewDate.judgeVoteDownInReviews(userId, curReviewId)
                curReviewsInAnswers.push(curReview)
            }
            let answerObj = new Object()
            answerObj.answerId = curAnswerId
            answerObj.content = curAnswer.content
            answerObj.reviews = curReviewsInAnswers
            answerObj.oldData=curAnswer.recentUpdatedTime
            answerObj.recentUpdatedTime = await answerDate.transferData(curAnswer.recentUpdatedTime)
            answerObj.voteUp = curAnswer.voteUp
            answerObj.voteDown = curAnswer.voteDown
            answerObj.voteUpNumber = curAnswer.voteUp.length
            answerObj.voteDownNumber = curAnswer.voteDown.length
            answerObj.voteUpJudge = await answerDate.judgeVoteUpInAnswers(userId, curAnswerId)
            answerObj.voteDownJudge = await answerDate.judgeVoteDownInAnswers(userId, curAnswerId)
            answersInQuestion.push(answerObj)
        }
        res.render('questionDetails/questionInfo.handlebars', {
            title:"Question Page",
            userId: userId,
            questionId: id,
            questionText: question.content,
            answersInQuestion: answersInQuestion,
            isFollowed:isFollowed
        });
    } catch (error) {
        throw error
        res.json("didn't find question")
    }
})


/**
 * add a new answer question 
 * questionId: id of target question
 */
router.post('/addAnswer/:questionId', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.params.questionId);
        let content = xss(req.body.content)
        if(!questionId||!content){
            res.json({
                status: false,
            });
            return
        }
        const newAnswer = await answerDate.addAnswer(content, userId, questionId)
        const newAnswerList = await transferData(questionId, req, res, userId)
        res.json({
            status: true,
            newAnswerList: newAnswerList
        });
    } catch (error) {
        throw error
    }
})

/**
 * add a new review to answer which under a question
 */
router.post('/addReview/:answerId', async (req, res) => {
    let userId = xss(req.session.user)
    if(!userId){
        res.redirect("/login")
    }
    // userId = "5fd82a4799eb7c385db27e09";
    let content = xss(req.body.content)
    // let questionId = xss(req.body.questionId);
    let answerId = xss(req.params.answerId);
    if(!content||!answerId){
        res.json({
            status: false,
        });
        return
    }
    const curReview = await reviewDate.addReview(content, userId, answerId)
    const curId=curReview._id.toString()
    curReview.reviewId = curId
    curReview.oldData=curReview.recentUpdatedTime
    curReview.recentUpdatedTime = await answerDate.transferData(curReview.recentUpdatedTime)
    curReview.voteUpNumber = curReview.voteUp.length
    curReview.voteDownNumber = curReview.voteDown.length
    curReview.voteUpJudge = await reviewDate.judgeVoteUpInReviews(userId, curId)
    curReview.voteDownJudge = await reviewDate.judgeVoteDownInReviews(userId, curId)
    res.json({
        status: true,
        curReview: curReview,
        answerId:answerId
    });
})

/**
 * vote up an answer
 */
router.post('/voteUpAnswer/:questionId/:answerId', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.params.questionId);
        let answerId = xss(req.params.answerId);
        if(!questionId||!answerId){
            res.json({
                status: false,
            });
            return
        }
        await answerDate.updateVoteUp(answerId, userId)
        const newAnswerList = await transferData(questionId, req, res, userId)
        res.json({
            status: true,
            newAnswerList: newAnswerList
        });
    } catch (error) {
        throw error
    }
})

/**
 * vote down an answer
 */
router.post('/voteDownAnswer/:questionId/:answerId', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.params.questionId);
        let answerId = xss(req.params.answerId);
        if(!questionId||!answerId){
            res.json({
                status: false,
            });
            return
        }
        await answerDate.updateVoteDown(answerId, userId)
        const newAnswerList = await transferData(questionId, req, res, userId)
        res.json({
            status: true,
            newAnswerList: newAnswerList
        });
    } catch (error) {
        throw error
    }
})

/**
 * vote up an review
 */
router.post('/voteUpReview/:questionId/:reviewId', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.params.questionId);
        let reviewId = xss(req.params.reviewId);
        if(!questionId||!reviewId){
            res.json({
                status: false,
            });
            return
        }
        // let test=req.body.test
        // console.log(test);
        let newReview=await reviewDate.updateVoteUp(reviewId,userId)
        let newReviewInAnswer=newReview.answerId
        const newAnswerList = await transferData(questionId, req, res, userId)
        res.json({
            status: true,
            newAnswerList: newAnswerList,
            newReviewInAnswer:newReviewInAnswer
        });
    } catch (error) {
        throw error
    }
})

/**
 * vote down an review
 */
router.post('/voteDownReview/:questionId/:reviewId', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.params.questionId);
        let reviewId = xss(req.params.reviewId);
        if(!questionId||!reviewId){
            res.json({
                status: false,
            });
            return
        }
        let newReview=await reviewDate.updateVoteDown(reviewId,userId)
        let newReviewInAnswer=newReview.answerId
        const newAnswerList = await transferData(questionId, req, res, userId)
        res.json({
            status: true,
            newAnswerList: newAnswerList,
            newReviewInAnswer:newReviewInAnswer
        });
    } catch (error) {
        throw error
    }
})

router.post('/sortByRecent', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.body.questionId);
        if(!questionId){
            res.json({
                status: false,
            });
            return
        }
        let answerList=await transferData(questionId, req, res, userId)
        let sortedAnswerList=await answerDate.sortAnswersByTime(answerList,-1);
        res.json({
            status: true,
            sortedAnswerList: sortedAnswerList,
        });
    } catch (error) {
        throw error
    }
})

router.post('/sortByPopular', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.body.questionId);
        if(!questionId){
            res.json({
                status: false,
            });
            return
        }
        let answerList=await transferData(questionId, req, res, userId)
        let sortedAnswerList=await answerDate.sortAnswersByVote(answerList,-1);
        res.json({
            status: true,
            sortedAnswerList: sortedAnswerList,
        });
    } catch (error) {
        throw error
    }
})

router.post('/sortReview/sortByPopular', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        // let questionId = xss(req.body.questionId);
        let answerId = xss(req.body.answerId);
        if(!answerId){
            res.json({
                status: false,
            });
            return
        }
        const answer=await answerDate.getAnswerById(answerId)
        let reviewListId=answer.reviews
        let reviewList=[];
        for (let index = 0; index < reviewListId.length; index++) {
            const curId = reviewListId[index];
            const curReview=await reviewDate.getReviewById(curId)
            curReview.reviewId = curId
            curReview.oldData=curReview.recentUpdatedTime
            curReview.recentUpdatedTime = await answerDate.transferData(curReview.recentUpdatedTime)
            curReview.voteUpNumber = curReview.voteUp.length
            curReview.voteDownNumber = curReview.voteDown.length
            curReview.voteUpJudge = await reviewDate.judgeVoteUpInReviews(userId, curId)
            curReview.voteDownJudge = await reviewDate.judgeVoteDownInReviews(userId, curId)
            reviewList.push(curReview)
        }
        reviewList=await reviewDate.sortReviewsByVote(reviewList,-1);
        res.json({
            status: true,
            sortedReviewrList: reviewList,
        });
    } catch (error) {
        throw error
    }
})

router.post('/sortReview/sortByRecent', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        // let questionId = xss(req.body.questionId);
        let answerId = xss(req.body.answerId);
        if(!answerId){
            res.json({
                status: false,
            });
            return
        }
        const answer=await answerDate.getAnswerById(answerId)
        let reviewListId=answer.reviews
        let reviewList=[];
        for (let index = 0; index < reviewListId.length; index++) {
            const curId = reviewListId[index];
            const curReview=await reviewDate.getReviewById(curId)
            curReview.reviewId = curId
            curReview.oldData=curReview.recentUpdatedTime
            curReview.recentUpdatedTime = await answerDate.transferData(curReview.recentUpdatedTime)
            curReview.voteUpNumber = curReview.voteUp.length
            curReview.voteDownNumber = curReview.voteDown.length
            curReview.voteUpJudge = await reviewDate.judgeVoteUpInReviews(userId, curId)
            curReview.voteDownJudge = await reviewDate.judgeVoteDownInReviews(userId, curId)
            reviewList.push(curReview)
        }
        reviewList=await reviewDate.sortReviewsByTime(reviewList,-1);
        res.json({
            status: true,
            sortedReviewrList: reviewList,
        });
    } catch (error) {
        throw error
    }
})

router.post('/followQ', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.body.questionId);
        if(!questionId){
            res.json({
                status: false,
            });
            return
        }
        await userData.followQuestion(userId,questionId)
        res.json({
            status: true,
            option:"unfollow"
        });
    } catch (error) {
        throw error
    }
})

router.post('/unfollowQ', async (req, res) => {
    try {
        let userId = xss(req.session.user)
        if(!userId){
            res.redirect("/login")
        }
        // userId = "5fd82a4799eb7c385db27e09";
        let questionId = xss(req.body.questionId);
        if(!questionId){
            res.json({
                status: false,
            });
            return
        }
        await userData.unfollowQuestion(userId,questionId)
        res.json({
            status: true,
            option:"follow"
        });
    } catch (error) {
        throw error
    }
})

async function transferData(questionId, req, res, userId) {
    const question = await questionsData.getQuestionById(questionId)
    questionContent = question.content
    const answersId = question.answers
    let answersInQuestion = new Array()     //obj array 
    for (let index = 0; index < answersId.length; index++) {
        let curReviewsInAnswers = new Array()
        let curAnswerId = answersId[index];
        let curAnswer = await answerDate.getAnswerById(curAnswerId)
        let curReviewIdArray = curAnswer.reviews
        for (let j = 0; j < curReviewIdArray.length; j++) {
            let curReviewId = curReviewIdArray[j];
            let curReview = await reviewDate.getReviewById(curReviewId)
            curReview.reviewId = curReviewId
            curReview.oldData=curReview.recentUpdatedTime
            curReview.recentUpdatedTime = await answerDate.transferData(curReview.recentUpdatedTime)
            curReview.voteUpNumber = curReview.voteUp.length
            curReview.voteDownNumber = curReview.voteDown.length
            curReview.voteUpJudge = await reviewDate.judgeVoteUpInReviews(userId, curReviewId)
            curReview.voteDownJudge = await reviewDate.judgeVoteDownInReviews(userId, curReviewId)
            curReviewsInAnswers.push(curReview)
        }
        let answerObj = new Object()
        answerObj.answerId = curAnswerId
        answerObj.voteUp = curAnswer.voteUp
        answerObj.voteDown = curAnswer.voteDown
        answerObj.content = curAnswer.content
        answerObj.reviews = curReviewsInAnswers
        answerObj.oldData=curAnswer.recentUpdatedTime
        answerObj.recentUpdatedTime = await answerDate.transferData(curAnswer.recentUpdatedTime)
        answerObj.voteUpNumber = curAnswer.voteUp.length
        answerObj.voteDownNumber = curAnswer.voteDown.length
        answerObj.voteUpJudge = await answerDate.judgeVoteUpInAnswers(userId, curAnswerId)
        answerObj.voteDownJudge = await answerDate.judgeVoteDownInAnswers(userId, curAnswerId)
        answersInQuestion.push(answerObj)
    }

    return answersInQuestion
}
;






module.exports = router;