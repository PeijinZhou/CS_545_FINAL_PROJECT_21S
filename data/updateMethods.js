const mongoCollections = require('../config/mongoCollections');
const questions = mongoCollections.questions;
const answers = mongoCollections.answers;
const users = mongoCollections.users;
const reviews = mongoCollections.reviews;

//helper method--parse id to objectId
async function myDBfunction(id) {
	//check to make sure we have input at all
	if (!id) throw 'Error: Id parameter must be supplied';
	//check to make sure it's a string
	if (typeof id !== 'string') throw "updateMethods|myDBfunction: id must be a string";

	let { ObjectId } = require('mongodb')
	let parsedId = ObjectId(id);
	return parsedId
}



async function addAnswer2(id, answerId) {
	//the answerId is the answer that the user answered
	if (!id || !answerId) throw 'users.js|addReview: you need to input id and answerId'
	if (typeof id !== 'string' || id.trim() === '') throw 'users.js|addReview: id must be non-empty string'
	if (typeof answerId !== 'string' || answerId.trim() === '') throw 'users.js|addReview: answerId must be non-empty string'

	let objectId = await myDBfunction(id)
	const userCollection = await users();
	const updateInfo = await userCollection.updateOne({ _id: objectId }, { $addToSet: { answers: answerId.trim() } })

	if (updateInfo.matchedCount === 0) throw `questions.js|updateQeustion(): answer ${id} not found`
	if (updateInfo.modifiedCount === 0) throw `questions.js|updateQeustion(): Nothing been updated.`


	const find = await userCollection.findOne({ _id: objectId });
	if (find == null) throw 'questions.js|addAnswer2():user not found';


	return find;


}
//update User db, add answerId to votedFor answers if not voted
//throw -1 if user already voted for this answer
//throw others if an error

async function updateUserVoteForAnswers(answerId, voterId) {
	var ObjectIdExp = /^[0-9a-fA-F]{24}$/
	if (!answerId || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
		throw `answerId in /data/answers.js/updateVoteDown has error`
	}
	if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
		throw `voterId in /data/answers.js/updateVoteDown has error`
	}
	
	const userCollection = await users()
	//check if user alreay voted
	const objectUserId = await myDBfunction(voterId)
	const findVoter = await userCollection.findOne({ _id: objectUserId });
	if (findVoter == null) throw 'questions.js|updateVoteUp2(): user not found';
	let votedAnsArr = findVoter.votedForAnswers;
	if (votedAnsArr.indexOf(answerId) !== -1) {
		throw -1
	} else {
		// add to answerId to set
		const updateInfo = await userCollection.updateOne({ _id: objectUserId }, { $addToSet: { votedForAnswers: answerId } })
		if (updateInfo.matchedCount === 0) throw `questions.js|updateVoteAnswer(): user ${voterId} not found`
		if (updateInfo.modifiedCount === 0) throw `questions.js|updateVoteAnswer(): Nothing been updated.`
	}

	const result = Object.assign({}, findVoter);
	result._id = findVoter._id.toString();

	return result;


}

//update User db, add reviewId to votedFor reviews if not voted
//throw -2 if user already voted for this review
//throw others if an error

async function updateUserVoteForReviews(reviewId, voterId) {
	var ObjectIdExp = /^[0-9a-fA-F]{24}$/
	if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
		throw `reviewId in /data/reviews.js/updateVoteDown has error`
	}
	if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
		throw `voterId in /data/reviews.js/updateVoteDown has error`
	}
	
	const userCollection = await users()
	//check if user alreay voted
	const objectUserId = await myDBfunction(voterId)
	const findVoter = await userCollection.findOne({ _id: objectUserId });
	if (findVoter == null) throw 'questions.js|updateVoteUp2(): user not found';
	let votedAnsArr = findVoter.votedForReviews;
	if (votedAnsArr.indexOf(reviewId) !== -1) {
		throw -2
	} else {
		// add to reviewId to set
		const updateInfo = await userCollection.updateOne({ _id: objectUserId }, { $addToSet: { votedForReviews: reviewId } })
		if (updateInfo.matchedCount === 0) throw `questions.js|updateVoteReview(): user ${voterId} not found`
		if (updateInfo.modifiedCount === 0) throw `questions.js|updateVoteReview(): Nothing been updated.`
	}

	const result = Object.assign({}, findVoter);
	result._id = findVoter._id.toString();

	return result;


}

//addVoteUpuserId for answers
async function addVoteUpForAnswer(answerId, userId){
	if(!answerId || !userId) throw 'updateMethods| addVoteUpForAnswer(): you need to input answerId and userId';
	if(typeof answerId !=='string'|| answerId.trim()==='') throw 'updateMethods|addVoteUpForAnswer(): answerId must be non-empty string'
	if(typeof userId !=='string'|| userId.trim()==='') throw 'updateMethods|addVoteUpForAnswer(): userId must be non-empty string'

	//check if user already vote for this answer
	try {
		const voteUser = await this.updateUserVoteForAnswers(answerId.trim(),userId.trim())
	} catch (error) {
		if(error === -1) throw `updateMethods|addVoteUpForAnswer(): user ${userId} alreay voted for this answer ${answerId}`
	}
	const objectAnswerId = await myDBfunction(answerId)
	const answerCollection = await answers();
	const updateInfo = await answerCollection.updateOne({_id:objectAnswerId},{$addToSet:{voteUp:userId}})
	if (updateInfo.matchedCount === 0) throw `questions.js|addVoteUpForAnswer(): user ${answerId} not found`
	if (updateInfo.modifiedCount === 0) throw `questions.js|addVoteUpForAnswer(): Nothing been updated.`
	//return updated answer
	const find = await answerCollection.findOne({_id:objectAnswerId})
	if(find == null) throw 'questions.js|addVoteUpForAnswer():user not found'
	
	return find
	
}
//addVoteDown for answer
//update users voteForAnswers
async function addVoteDownForAnswer(answerId, userId){
	if(!answerId || !userId) throw 'updateMethods| addVoteDownForAnswer(): you need to input answerId and userId';
	if(typeof answerId !=='string'|| answerId.trim()==='') throw 'updateMethods|addVoteDownForAnswer(): answerId must be non-empty string'
	if(typeof userId !=='string'|| userId.trim()==='') throw 'updateMethods|addVoteDownForAnswer(): userId must be non-empty string'

	//check if user already vote for this answer
	try {
		const voteUser = await this.updateUserVoteForAnswers(answerId.trim(),userId.trim())
	} catch (error) {
		if(error === -1) throw `updateMethods|addVoteDownForAnswer(): user ${userId} alreay voted for this answer ${answerId}`
	}
	const objectAnswerId = await myDBfunction(answerId)
	const answerCollection = await answers();
	const updateInfo = await answerCollection.updateOne({_id:objectAnswerId},{$addToSet:{voteDown:userId}})
	if (updateInfo.matchedCount === 0) throw `questions.js|addVoteDownForAnswer(): user ${answerId} not found`
	if (updateInfo.modifiedCount === 0) throw `questions.js|addVoteDownForAnswer(): Nothing been updated.`
	//return updated answer
	const find = await answerCollection.findOne({_id:objectAnswerId})
	if(find == null) throw 'questions.js|addVoteDownForAnswer():user not found'
	
	return find
	
}

//addVoteUp for Reviews db
//update users voteForReviews
async function addVoteUpForReview(reviewId, userId){
	if(!reviewId || !userId) throw 'updateMethods| addVoteUpForReview(): you need to input reviewId and userId';
	if(typeof reviewId !=='string'|| reviewId.trim()==='') throw 'updateMethods|addVoteUpForreview(): reviewId must be non-empty string'
	if(typeof userId !=='string'|| userId.trim()==='') throw 'updateMethods|addVoteUpForreview(): userId must be non-empty string'

	//check if user already vote for this review
	try {
		const voteUser = await this.updateUserVoteForReviews(reviewId.trim(),userId.trim())
	} catch (error) {
		if(error === -2) throw `updateMethods|addVoteUpForreview(): user ${userId} alreay voted for this review ${reviewId}`
	}
	const objectReviewId = await myDBfunction(reviewId)
	const reviewCollection = await reviews();
	const updateInfo = await reviewCollection.updateOne({_id:objectReviewId},{$addToSet:{voteUp:userId}})
	if (updateInfo.matchedCount === 0) throw `questions.js|addVoteUpForReview(): user ${reviewId} not found`
	if (updateInfo.modifiedCount === 0) throw `questions.js|addVoteUpForReview(): Nothing been updated.`
	//return updated review
	const find = await reviewCollection.findOne({_id:objectReviewId})
	if(find == null) throw 'questions.js|addVoteUpForReview():user not found'
	let result = Object.assign({},find)
	result._id = find._id.toString()
	return result
}

//add voteDown for reviews db
//update users votedFor Reviews
async function addVoteDownForReview(reviewId, userId){
	if(!reviewId || !userId) throw 'updateMethods| addVoteDownForReview(): you need to input reviewId and userId';
	if(typeof reviewId !=='string'|| reviewId.trim()==='') throw 'updateMethods|addVoteDownForreview(): reviewId must be non-empty string'
	if(typeof userId !=='string'|| userId.trim()==='') throw 'updateMethods|addVoteDownForreview(): userId must be non-empty string'

	//check if user already vote for this review
	try {
		const voteUser = await this.updateUserVoteForreviews(reviewId.trim(),userId.trim())
	} catch (error) {
		if(error === -2) throw `updateMethods|addVoteDownForreview(): user ${userId} alreay voted for this review ${reviewId}`
	}
	const objectReviewId = await myDBfunction(reviewId)
	const reviewCollection = await reviews();
	const updateInfo = await reviewCollection.updateOne({_id:objectReviewId},{$addToSet:{voteDown:userId}})
	if (updateInfo.matchedCount === 0) throw `questions.js|addVoteDownForReview(): user ${reviewId} not found`
	if (updateInfo.modifiedCount === 0) throw `questions.js|addVoteDownForReview(): Nothing been updated.`
	//return updated review
	const find = await reviewCollection.findOne({_id:objectReviewId})
	if(find == null) throw 'questions.js|addVoteDownForReview():user not found'
	let result = Object.assign({},find)
	result._id = find._id.toString()
	return result
}

module.exports = {addAnswer2,updateUserVoteForAnswers,updateUserVoteForReviews,addVoteUpForAnswer,addVoteDownForAnswer,addVoteUpForReview,addVoteDownForReview}