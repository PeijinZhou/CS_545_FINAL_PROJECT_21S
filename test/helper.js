const dbConnection = require('../.vscode/config/mongoConnection');
const mongoCollections = require('../.vscode/config/mongoCollections');
const { ObjectID } = require('mongodb');
// const data = require('../data');
//  const users = data.users;
//  const questions = data.questions;
//  const answers = data.answers;
//  const reviews = data.reviews;
//const systemConfigs = data.systemConfigs;
const usersData = mongoCollections.users;
const questionsData = mongoCollections.questions;
const answersData = mongoCollections.answers;
const reviewsData = mongoCollections.reviews;
const systemConfigsData = mongoCollections.systemConfigs;
const usersDataSet = {
    user:{
        userName: "abcd123",
       email:"abcd123@gmail.com" ,
       password:"elementarymydearwatson",
       hashedPassword: "$2a$16$7JKSiEmoP3GNDSalogqgPu0sUbwder7CAN/5wnvCWe6xCKAKwlTD."
     },
     questioner:{
        userName: "questinoer",
        email:"tool_question_man@gmail.com" ,
        password:"elementarymydearwatson",
        hashedPassword: "$2a$16$7JKSiEmoP3GNDSalogqgPu0sUbwder7CAN/5wnvCWe6xCKAKwlTD."
     },
    answerer: {
        userName: "tool_answer_man",
       email:"tool_answer_man@gmail.com" ,
       password: "damnyoujackdonaghy",
       hashedPassword: "$2a$16$SsR2TGPD24nfBpyRlBzINeGU61AH0Yo/CbgfOlU1ajpjnPuiQaiDm"
    },
    reviewer : {
        userName: "tool_review_man",
       email:"tool_review_man@gmail.com" ,
       password: "quidditch",
       hashedPassword: "$2a$16$4o0WWtrq.ZefEmEbijNCGukCezqWTqz1VWlPm/xnaLM8d3WlS5pnK"
    }

}

async function addUser(user){
    let {userName, email, hashedPassword} = user;
    usersCollection = await usersData();
    const insertInfo = await usersCollection.insertOne({
        userName: userName,
        email:email,
        hashedPassword:hashedPassword,
        dateSignedIn: new Date(),
        city: "new york city",
        state: "NJ",
        questions: [],
        answers: [],
        reviews: [],
        votedForReview:[],
        votedForAnswers: []
    });
    if (insertInfo.insertedCount === 0) throw `Error: could not add new user.`;
    const newUserId = insertInfo.insertedId.toString();
    return newUserId;
}

async function addQuestion(content, topic, questioner) {

    let newQuestion = {
        content: content,
        topic: topic,
        questioner: questioner,
        questionCreatedTime: new Date(),
        answers: []
    }
    const questionsCollection = await questionsData();
    const usersCollection = await usersData();
    const insertInfo = await questionsCollection.insertOne(newQuestion);
    if (insertInfo.insertedCount === 0) throw 'Error: could not add question'
    let newId = insertInfo.insertedId.toString()
    const updatedInfo = await usersCollection.updateOne({ _id: ObjectID(questioner) }, { $addToSet: { questions: newId } })
    if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
        throw 'No user being updated.'
    }


    return newId;
}
async function addAnswer(content, answerer, questionId) {

    const newAnswer = {
        content: content,
        recentUpdatedTime: new Date(),
        answerer: answerer,
        questionId: questionId,
        reviews:[],
        voteUp: [],
        voteDown: []
    };
    const answersCollection = await answersData();
    const usersCollection = await usersData();
    const questionsCollection = await questionsData();

    const insertInfo = await answersCollection.insertOne(newAnswer);
    if (insertInfo.insertedCount === 0) {
        throw 'Insert failed!';
    }
    const newId = insertInfo.insertedId.toString();
    //update answerer
    const updatedInfo = await usersCollection.updateOne({ _id: ObjectID(answerer) }, { $addToSet: { answers: newId } })
    if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
        throw 'No user being updated.'
    }

    //update question
    const updatedInfo2 = await questionsCollection.updateOne({ _id: ObjectID(questionId) }, { $addToSet: { answers: newId } })
    if (updatedInfo2.matchedCount === 0 || updatedInfo2.modifiedCount === 0) {
        throw 'No question being updated.'
    }
    return newId;

}

async function addReview(content, reviewer, answerId) {
    

    const newReview = {
        content: content,
        recentUpdatedTime: new Date(),
        Reviewer: reviewer,
        answerId: answerId,
        voteUp: [],
        voteDown: []
    }
    const reviewsCollection = await reviewsData();
    const answersCollection = await answersData();
    const usersCollection = await usersData();

    const insertInfo = await reviewsCollection.insertOne(newReview);
    if (insertInfo.insertedCount === 0) {
        throw 'Insert failed!';
    }
    const newId = insertInfo.insertedId.toString();
    
    //upadte reviewer
    const updatedInfo = await usersCollection.updateOne({ _id: ObjectID(reviewer) }, { $addToSet: { reviews: newId } })
    if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
        throw 'No user being updated.'
    }

    //update answer
    const updatedInfo2 = await answersCollection.updateOne({ _id: ObjectID(answerId) }, { $addToSet: { reviews: newId } })
    if (updatedInfo2.matchedCount === 0 || updatedInfo2.modifiedCount === 0) {
        throw 'No answer being updated.'
    }
    return newId;
}

async function addVoteUptoReview(reviewId, voterId) {
    const reviewsCollection = await reviewsData();
    const usersCollection = await usersData();

    //upadte voter
    const updatedInfo = await usersCollection.updateOne({ _id: ObjectID(voterId) }, { $addToSet: { votedForReview: reviewId } })
    if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
        throw 'No user being updated.'
    }

    //update review

    const updatedInfo2 = await reviewsCollection.updateOne({ _id: ObjectID(reviewId) }, { $addToSet: { voteUp: voterId } })
    if (updatedInfo2.matchedCount === 0 || updatedInfo2.modifiedCount === 0) {
        throw 'No review being updated.'
    }
    return true;
}

async function addVoteUptoAnswer(answerId, voterId) {
    const answersCollection = await answersData();
    const usersCollection = await usersData();

    //upadte voter
    const updatedInfo = await usersCollection.updateOne({ _id: ObjectID(voterId) }, { $addToSet: { votedForAnswer: answerId } })
    if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
        throw 'No user being updated.'
    }

    //update answer

    const updatedInfo2 = await answersCollection.updateOne({ _id: ObjectID(answerId) }, { $addToSet: { voteUp: voterId } })
    if (updatedInfo2.matchedCount === 0 || updatedInfo2.modifiedCount === 0) {
        throw 'No answer being updated.'
    }
    return true;
}

async function clearDB(){
    const db = await dbConnection();
    await db.dropDatabase();
    console.log("clear db");
    return true;
}
module.exports = {
    usersDataSet,
    addUser,
    addQuestion,
    addAnswer,
    addReview,
    addVoteUptoAnswer,
    addVoteUptoReview,
    clearDB
}