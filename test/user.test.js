const assert = require('assert');
const bcrypt = require('bcrypt');
const users = require('../data/users');
const dbConnection = require('../.vscode/config/mongoConnection');
const mongoCollections = require('../.vscode/config/mongoCollections');
const usersData = mongoCollections.users;
const questionsData = mongoCollections.questions;
const answersData = mongoCollections.answers;
const reviewsData = mongoCollections.reviews;const { ObjectId } = require('mongodb');
const { doesNotMatch } = require('assert');
const helper = require('./helper');

describe('#addUser', function(){
    
    let userFinded;
    let usersCollection;
    let test_username = "test_man";
    let test_email =  "tool_answer_man@gmail.com" ;
    let test_password = "elementarymydearwatson";
    let userId;
    let passwordCompareToDB;
    describe('addUser', () => {

    before(async function () {
        this.timeout(100000);
        const db = await dbConnection();
        await db.dropDatabase();
        console.log('initialize user:');
        //hashed password with 16 salt rounds 
        usersCollection = await usersData();
        try {
            userId = await users.addUser(test_email, test_password ,test_username);
        } catch (error) {
            console.log(error);
        }
        
        userFinded = await usersCollection.findOne({"_id": userId._id});
        passwordCompareToDB = await bcrypt.compare(test_password, userFinded.hashedPassword);
    });

    after(function () {
        console.log('after.');
    });

    beforeEach(function () {
        console.log('  beforeEach:');
    });

    afterEach(function () {
        console.log('  afterEach.');
    });

    it('user should be added', (done) => {
        assert.notStrictEqual(userFinded, null);
        done();
    });

    it('user should have right information', (done) => {
        assert.strictEqual( userFinded.userName, test_username);
        assert.strictEqual( userFinded.email, test_email);
        done();
    });

    it('user should have right hashed password', (done) => {
        
        assert.strictEqual( passwordCompareToDB, true);
        done();
    });


    });
});

describe('#removeUser', function(){
    let userId;
    let questionId;
    let answerId;
    let reviewId;
    let votedAnswerId;
    let votedReviewId;
    let reviewedAnswerId;
    let answeredQuestionId;

    let userInformation = helper.usersDataSet.user;
    let userFinded;
    let questionFinded;
    let answerFinded;
    let reviewFinded;
    let votedAnswer;
    let votedReview;

    describe('removeUser', () => {

    before(async function () {
        this.timeout(100000);
        const usersCollection = await usersData();
        const answersCollection = await answersData();
        const questionsCollection = await questionsData();
        const reviewsCollection = await reviewsData();

        await helper.clearDB();
        console.log('initialize user:');
        try{
        	userId = await helper.addUser(userInformation);
        }catch(e){
            console.error(e);
            return;
        }
        //add question
        questionId = await helper.addQuestion("question", "test", userId);

        //add other's question to test whether deleted the answer of other question
        let questionerId = await helper.addUser(helper.usersDataSet.questioner);
        let questioner_question_Id = await helper.addQuestion("questioner's question", "test", questionerId);
        answerId = await helper.addAnswer("answer", userId, questioner_question_Id);
        answeredQuestionId = questioner_question_Id;
        
        //add other's answer to test whether deleted the review of other answer
        let answererId = await helper.addUser(helper.usersDataSet.answerer);
        let answerer_answer_Id = await helper.addAnswer("answerer's answer", answererId, questioner_question_Id)
        reviewId = await helper.addReview("review", userId, answerer_answer_Id);
        reviewedAnswerId = answerer_answer_Id;
        //add voteUp to answerer's answer
        await helper.addVoteUptoAnswer(answerer_answer_Id, userId);
        votedAnswerId = answerer_answer_Id;

        //add voteUp to reviewer's review
        let reviewerId = await helper.addUser(helper.usersDataSet.reviewer);
        let reviewer_review_Id = await helper.addReview("reviewer's review", reviewerId, answerer_answer_Id);
        await helper.addVoteUptoReview(reviewer_review_Id, userId);
        votedReviewId = reviewer_review_Id;
        //initialization finished

        await users.removeUser(userId);
        userFinded = await usersCollection.findOne({"_id": ObjectId(userId)});
        questionFinded = await questionsCollection.findOne({"_id": ObjectId(questionId)});
        answerFinded = await answersCollection.findOne({"_id": ObjectId(answerId)});
        reviewFinded = await reviewsCollection.findOne({"_id": ObjectId(reviewId)});
        answeredQuestion = await questionsCollection.findOne({"_id": ObjectId(answeredQuestionId)});
        reviewedAnswer = await answersCollection.findOne({"_id": ObjectId(reviewedAnswerId)});

        votedAnswer = await answersCollection.findOne({"_id": ObjectId(votedAnswerId)});

        votedReview = await reviewsCollection.findOne({"_id": ObjectId(votedReviewId)});

    });
    after(function () {
        console.log('after.');
    });

    beforeEach(function () {
        console.log('  beforeEach:');
    });

    afterEach(function () {
        console.log('  afterEach.');
    });

    it('user should be removed', (done) => {
        assert.strictEqual(userFinded, null);
        done();
    });

    it('question should be removed', (done) => {
        assert.strictEqual(questionFinded, null);
        done();
    });
    it('answer should be removed', (done) => {
        assert.strictEqual(answerFinded, null);
        done();
    });
    it('review should be removed', (done) => {
        assert.strictEqual(reviewFinded, null);
        done();
    });

    it('answered question should be updated', (done) => {
        let answers = answeredQuestion.answers;
        assert.strictEqual(answers.indexOf(answerId), -1);
        done();
    });

    it('reviewed answer should be updated', (done) => {
        let reviews = reviewedAnswer.reviews;
        assert.strictEqual(reviews.indexOf(reviewId), null);
        done();
    });

    it('voted up answer should be updated', (done) => {
        let voteUp = votedAnswer.voteUp;
        assert.strictEqual(voteUp.indexOf(userId), null);
        done();
    });

    it('voted up review should be updated', (done) => {
        let voteUp = votedReview.voteUp;
        assert.strictEqual(voteUp.indexOf(userId), null);
        done();
    });

    });
});

