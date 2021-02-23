const express = require('express');
const router = express.Router();
const data = require('../data');
const questionsData = data.questions;
const mongoCollections = require('../config/mongoCollections');
const systemConfigs = data.systemConfigs;
const questions = mongoCollections.questions;
const xss = require('xss');
//test mode setting, assign a dummy user
const test = false;

let topics = []
router.get('/', async (req, res) => {
	try {
		topics = await systemConfigs.getTopics()
		res.render('ask/ask', { topic: topics,title:"Ask Question" });
	} catch (error) {
		const errorMsg = "Page inital wrong.";
		errors.push(errorMsg);
		res.status(500).render('ask/ask', { errors: errors, topic: [], question: ''});
		return
	}
	

})

router.post('/', async (req, res) => {
	
	if (!req.session.user) {
		//if user not exist, redirect to login page
		res.status(403).redirect('/login')
		return;
	}
	let errors = []
	let topics = []
	try {
		topics = await systemConfigs.getTopics()
		if (topics == null) {
			res.status(404).json('topics initial wrong.')
			return
		}
	} catch (error) {
		const errorMsg = "Get topics wrong."
		errors.push(errorMsg)
		res.status(404).render('ask/ask', { errors: errors});
		return;
		
	}
	const quesInfo = req.body;
	
//	console.log(quesInfo)
	
	if (!quesInfo) {
		const errorMsg = "You need to write something for the question";
		errors.push(errorMsg);
		res.status(404).render('ask/ask', { errors: errors});
		return;

	}
	let questioner = xss(req.session.user);
	let content = xss(req.body.question);
	let topic = xss(req.body.topic);
	if (!content) {
		const errorMsg = 'You need to ask something';
		errors.push(errorMsg);
	}
	if (!topic) {
		const errorMsg = 'You need to select a topic';
		errors.push(errorMsg);
	}

	
	

	//check whether QuestionName duplicated
	const questionCollection = await questions();
	const findQuestion = await questionCollection.findOne({ content: content })
	if (findQuestion) {
		const errorMsg = 'Question already exists.';
		errors.push(errorMsg);
		//if there is already same question, show a link to the exist question
		const qId = findQuestion._id.toString();
		res.render('ask/ask', { errors: errors, topic: topics, question: content, oldQuestionId:qId  });
		return;
	}
	// console.log(quesInfo);
	if (errors.length > 0) {
		res.render('ask/ask', { errors: errors, topic: topics, question: content });
		return;
	}

	try {
		
		const newQuestion = await questionsData.addQuestion(content, topic, questioner);
		res.render('ask/askSuccess', { questionId: newQuestion._id.toString() ,title:"Ask Success"});
	//	console.log(newQuestion._id.toString())
	} catch (error) {
	
		const errorMsg = "Ask question failed."
		errors.push(error);
		res.status(404).render('ask/ask', { errors: errors, topic: topics, question: content });
		return;
	}



})
module.exports = router;
