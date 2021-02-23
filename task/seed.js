/*
Generate data to database for test.
Just for test, all data in this file are hardcoded,
but in each module we need to use the functions in data file(../data/) to operate the database.
*/
const dbConnection = require('../config/mongoConnection');
const mongoCollections = require('../config/mongoCollections');
const data = require('../data');
const users = data.users;
const bcrypt = require('bcrypt')
const saltRounds = 16;
const questions = data.questions;
const answers = data.answers;
const reviews = data.reviews;
const updateMethods = data.updateMethods;
const systemConfigs = data.systemConfigs;
const usersData = mongoCollections.users;
const questionsData = mongoCollections.questions;
const answersData = mongoCollections.answers;
const reviewsData = mongoCollections.reviews;
const systemConfigsData = mongoCollections.systemConfigs;
const xss = require('xss')



const main = async () => {
	const usersCollection = await usersData();
	const questionsCollection = await questionsData();
	const answersCollection = await answersData();
	const reviewsCollection = await reviewsData();
	const systemConfigsCollection = await systemConfigsData();
	const db = await dbConnection();
	//delete the whole database.
	await db.dropDatabase();

	//initial topics

	try {
		const initTopics = await systemConfigs.initialTopics()
		let topics = await systemConfigs.getTopics();

	} catch (error) {
		console.log(error)
	}

	const topics = ["Books", "Music", "Movies", "Wine", "Cooking", "Travel", "Other"]
	//length 20
	const userNameList = ["test", "angel", "bubbles", "shimmer", "glimmer", "doll", "JayChou", "VenomFate", "Frozen", "DarkSide",
		"hateJava", "hateCPP", "UltimateBeast", "RockieMountain", "MusicViking", "SloppyJoe", "Marry2020", "Avatar2022", "McDon2020", "SupperBug2020"]

	const emailList = ["test@test.com", "yholako.vip9@brackettmail.com", "linsaf10insafe@eshtaholdings.com", "6medo.shagareen2@emphasysav.com", "khassnha@chanmelon.com",
		"4akra@wikirefs.com", "wtarekmasaoo@fogmart.com", "zelegant.youn@garagedoorselmirage.com", "nlkalbef@vermontamazon.com", "ishala@malomiesed.com",
		"0jorgearman@factorypeople.com", "4owtrageous.pe@esbuah.nl", "graysalinax@aloftventure.com", "phamza_evan@encodium.com", "pmido_mahmoud5217@lttmobile.com",
		"0sweet.ismarica4@kittiza.com", "izahra@chatur21bate.com", "0meyree.int@aristockphoto.com", "ipras@atourfinest.com", "ymoham@texasaol.com"]

	const passwordList = ["Test1234", "MbepHPIW6x", "Dqj7IGTtCW", "XaD7vIn6de", "riYXGhIVvo", "nr4KqV4tp9", "bQxEY84gMO", "dNyPnBjeU2", "VF7G2Oln75",
		"bCTnWwjbvV", "cFaJelkkgO", "iI7DQUrlnb", "CQRTuQ9cPi", "uKlryiqWNk", "7fr6nmaXQY", "2UFF41aBNy",
		"cemSfZcMFd", "Sf00QMS6hU", "qS35qODo1M", "WpHrCUkwIb"]

	//helper function to generate random time between given range
	function randomTime(startTime, endTime) {
		let start = new Date(startTime);
		let end = new Date(endTime);
		let diff = end.getTime() - start.getTime();
		let new_diff = diff * Math.random();
		let date = new Date(start.getTime() + new_diff);
		return date;
	}
	
	// create 20 users
	
	const userIdList = []

	let hashList = [
		'$2b$16$K/1P03X5HcF6sINwD4OS1uAK5SXNKgg44dL1bVSLwuig.1l3Y.p2i',
		'$2b$16$SHplLpem6RAfkIqB9KS9uuZrddAZPHOdko7tLoV8xlHKG1Gx1jr8W',
		'$2b$16$eUEoYIWhMDY8z9tWqqqrUeC0cqSurj8FAjRlzg7I38.ORtv/V1z1C',
		'$2b$16$VRadUyEwwXSZXXslGDCr1.b76K4uXQzZtP8mHxSIZusIqp0oS6sIW',
		'$2b$16$gqdd8gDkMPMR0TosyWkoYOyCjSwMGxcSge8JGmb6LwYRy1YBaYut.',
		'$2b$16$4PNubHE484L8qxsXP.04oeUkHhJFhd9EmT6DxcgXuwFUW8O3NPprO',
		'$2b$16$1FBuqu.tc5M5uukpxI1L4.RVpoao8Uhmg7WGRZw9bxTWBfQ.gXgjK',
		'$2b$16$vz4IJ6YMDXPEMaA/ZZaRXO9.2wvkiSZLsq5VkzYE3PRNYCzj.IWbC',
		'$2b$16$lbbC73fR9zup2FBFv8H7vezODUXWUpqu4IuUqTgPxqkone9VCltEy',
		'$2b$16$.Lagsby.xaY5LueB9P5vduTEVPK13x3Q5nBvQV10sBMsu3LLArqs2',
		'$2b$16$LPqRrz8p3MoHqlc4.AAHSOyzgv1K2qvkoAgZrm4OOATu.tUuLzzV.',
		'$2b$16$QdHX0c/mwzB4wAltlSRfSeuA0Pfa5sqoiZdkhc23S/XMHP.FBD.32',
		'$2b$16$4FdQtFbbrzKssSW4NXRIsuvKrM1NBEfWgEOdD7Y5rwsKwzEV7Ksb.',
		'$2b$16$1fYC3EZsQVCj1GreG6tKAubUP7VlN0b/58n5lX4dy64QngBy9MTrW',
		'$2b$16$grbx60y0eTyTrleskvO8H.9fsoXFN4gqBcXGXptsS6mq6qaB9DDV6',
		'$2b$16$pdSaFOcWqJueii3Cr9qLL.gUoOXWv/GibNRSaXyyvO/VM58ojl4XG',
		'$2b$16$LmYu3cojufEtZhV3AWR/iecoDtJ.XZmLC54BxJSGCnv0oz3GntfBi',
		'$2b$16$/70GAZA7snsY8iZTrcS21O3MrwM1JCJBH2dkj6pbCh8RLgTE5v27O',
		'$2b$16$tsbE0wDdszo/Tqg4jKUKBeMloROUi4qncUssoL/mGELJ9kzhN044G',
		'$2b$16$tWHIrcFn6/w7Ft0FtQYjheMRx2z.irdyyTqBGy7kdjUFYo3yFSiQS'
	  ]

	//
	//	  const hash = await bcrypt.hash('Test1234',saltRounds);
	//			console.log(hash)
	try {
		for (let i = 0; i < userNameList.length; i++) {
			let newTime = randomTime('July 20, 2000 00:20:18 GMT+00:00', 'December 02, 2010 00:20:18 GMT+00:00');
			//console.log(newTime);
			//const hash = await bcrypt.hash(xss(passwordList[i].trim()),saltRounds);
			//console.log(xss(passwordList[i].trim()))
			//hashList.push(hash)
			const newUser = {
				userName: userNameList[i],
				email: emailList[i],
				//hashedPassword:hash,
				hashedPassword: hashList[i],
				dateSignedIn: newTime,
				questions: [],
				answers: [],
				reviews: [],
				votedForReviews: [],
				votedForAnswers: [],
				followedQuestions: []
			};
			//	const addUser = await users.addUser(emailList[i],hashList[i],userNameList[i])
			//shuffle user created time
			const insertInfo = await usersCollection.insertOne(newUser)
			if (insertInfo.insertedCount === 0) throw `Error: could not add new user.`;
			const newUserId = insertInfo.insertedId.toString();
			userIdList.push(newUserId)
			//const updatedInfo = await usersCollection.updateOne({ _id: newUserId }, { $set: { recentUpdatedTime: newTime } });
			//if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
			//	throw 'seed.js: no time of reviews being updated.'
			//}
			//	userIdList.push(addUser._id.toString())
		}
	//	console.log(hashList)
		//	console.log(userIdList)
	} catch (error) {
		console.log(error)
	}


	let bookQuestionList = ["What is the best non-fiction book of 2020?", "Any Horror novelist better than Steven King?", "Is Pulizer the highest honor for novels?", "What is the best book you've read in 2020?", "How to read books fast?", "Where to buy second-hand Computer Science books?",
		"Is there a book that change your life？", "When is your favourite time to read?", "Everything on web now, do we still need paper-version book any more?", "When will Micheal Cunningham publish his new novel? Can't wait...",
		"Is there more Harry Porter series?", "Is Game of Thrones book series finished?", "Which book in the world has the most popular reader?"]
	let musicQuestionList = ["Why jazz music makes me feel relaxed?", "What do you listen when driving?", "Who is Game of Thrones TV music composer?",
		"Which prime musci station do you recommand for listening during coding?", "Why classical music not popular anymore?",
		"Which singer is your favourite?", "Why people say 'The Beatles' creates a history?", "What music is most popular restaurant music?"
		, "What does the BillBoard mean to a singer?", "Why country music not popular anymore?",
		"What do you listen when you are cooking?", "Who's songs are popular in 2020?", "What is your favourite classical music composer?", "Why Billie Ellish so popular? Do you think her songs are good?"]
	let movieQuestionList = ["Best Si-Fi movie you think?", "Best romantic movie in your opinion?",
		"What is the highest rated movie you think?", "When will 'Avatar2' be revealed?", "Why it takes more than 10 years to produce Avatar2?", "Do you like Disney Animation or Pixar? why",
		"Movies that you didn't figured out after watching it?", "What movie to watch in the first date?", "What does drama genre mean for movie?", "What does PG movie mean?", "Is kids movies really good for kids to watch?",
		"Any movies recommand for Christmas Eve?", "What is the most popular Horror movies?", "Why there is not much new movies this year?", "Any forein language movies recommand?"]
	let wineQuestionList = ["Is California the biggest wine producing location?", "Why people in cold area drink more than other area?",
		"Why young people choose beer over wine?", "Is white wine really anti-aging?", "Red or white wine, which do you prefer?", "Which French brand wine do you recommand?", "Why grape wine is popular?"]
	let cookQuestionList = ["Cooking 2 hours, eating 10 minutes, worth it?", "How to master French cooking?", "How to cook pasta?",
		"What is best cooking recipies website?", "How to cook beef broth?", "How to make pizza?", "How to cook fried rice?", "How to cook Italian style meatball?",
		"Why cooking videos are popular in YouTube?", "Why Chinese takout so popular in NY?", "Is boroccoli the healthest vegi?", "Why cast iron cook are good choice for making broth?", "Air dry machine better than oven?"]
	let travelQuestionList = ["Why people like travel?", "What is the meaning of traveling?", "5 star hotel or knapsack travel, what do you get from different ways of travel?", "What is the most popular place to go during Christmas?",
		"Please recommand some place to go during summer?", "France vs. Japan? where for a 2 week vocation?", "Which rent company do you recommand during travel?", "Is it safe travel alone?"]
	let otherQuestionList = ["What do you do when you're bored?", "Is there any people really viewing this website?", "Where are you going? Where Have You Been?", "Is stock market better than last year?", "Do you guys ask about life meaning related questions here?"]
//	console.log(bookQuestionList.length)
//	console.log(musicQuestionList.length)
//	console.log(movieQuestionList.length)

	let questionIdList = []
	//create questions 
//	let quest = []
	let questionList = [bookQuestionList, musicQuestionList, movieQuestionList, wineQuestionList, cookQuestionList, travelQuestionList, otherQuestionList]
	let remain = bookQuestionList.length + musicQuestionList.length + movieQuestionList.length + wineQuestionList.length + cookQuestionList.length + travelQuestionList.length + otherQuestionList.length
	try {
		let seeds = true;
		let j = 0;
		while (seeds) {
			for (let i = 0; i < questionList.length; i++) {
				if (questionList[i].length > 0) {
					const newQuestion = await questions.addQuestion(questionList[i][0], topics[i], userIdList[j]);
					questionIdList.push(newQuestion._id.toString())
				//	quest.push(newQuestion.content)
					questionList[i].splice(0, 1);
					j = (j + 2) % 10;
					remain--;
				}

			}

			if (remain === 0) {
				seeds = false;
			}
		}
		//	console.log(quest)
	} catch (error) {
		console.log(error);

	}
	//add followers to question

	for (let i = 0; i < userIdList.length; i++) {
		for (let j = 0; j < questionIdList.length; j++) {
			//  1/10 chance to follow or not
			let follow = Math.floor(Math.random() * 10)
			if (follow === 1) {
				try {
					const follower = await users.followQuestion(userIdList[i], questionIdList[j])
				} catch (error) {
					console.log(error)
				}
			}
		}

	}


	//add answers
	try {
		//async addAnswer(content, answerer, questionId)

		await answers.addAnswer("Children's book I think", userIdList[2], questionIdList[0]);
		await answers.addAnswer("Dare to Lead", userIdList[1], questionIdList[0]);
		await answers.addAnswer("Think Like a Monk is my guess", userIdList[5], questionIdList[0]);
		await answers.addAnswer("I think because there is no clues to follow, LOL.", userIdList[1], questionIdList[1]);
		await answers.addAnswer("It sounds like background noise.", userIdList[3], questionIdList[1]);
		await answers.addAnswer("I think you just don't like it. Some people feel different way.", userIdList[5], questionIdList[1]);
		await answers.addAnswer("I feel the same.", userIdList[10], questionIdList[1]);
		await answers.addAnswer("Tenet", userIdList[1], questionIdList[2]);
		await answers.addAnswer("Avatar, if it is a sifi.", userIdList[5], questionIdList[2]);
		await answers.addAnswer("Matrix", userIdList[2], questionIdList[2]);
		await answers.addAnswer("Man in Black.", userIdList[9], questionIdList[2]);
		await answers.addAnswer("UPGRADE, my best.", userIdList[13], questionIdList[2]);
		await answers.addAnswer("E.T.", userIdList[15], questionIdList[2]);
		await answers.addAnswer("Arrival", userIdList[19], questionIdList[2]);
		await answers.addAnswer("I thought France.", userIdList[1], questionIdList[3]);
		await answers.addAnswer("Not Italy?", userIdList[2], questionIdList[3]);
		await answers.addAnswer("When it is your hobby, you will be in the FLOW...", userIdList[1], questionIdList[4]);
		await answers.addAnswer("Well, I don't think it worthy at all. Especially, someone complains after eating it.", userIdList[13], questionIdList[4]);
		await answers.addAnswer("Not at all, that's why McDonald so popular.", userIdList[13], questionIdList[4]);
		await answers.addAnswer("People just get bored easily, need something new.", userIdList[1], questionIdList[5]);
		await answers.addAnswer("And acturally everyplace now is similar to each other.", userIdList[1], questionIdList[5]);
		await answers.addAnswer("You need to know the planet you live for all your life.", userIdList[17], questionIdList[5]);
		await answers.addAnswer("It makes me forget the real life troubles, feels like live in a unreal world.", userIdList[16], questionIdList[5]);
		await answers.addAnswer("I have no idea and it wastes lots of money.", userIdList[15], questionIdList[5]);
		await answers.addAnswer("Sleeping", userIdList[1], questionIdList[6]);
		await answers.addAnswer("I think workout will kill the time meaningfully", userIdList[0], questionIdList[6]);
		await answers.addAnswer("Sliding my cell.", userIdList[3], questionIdList[6]);
		await answers.addAnswer("Since smartphone came to the world, I never get bored", userIdList[0], questionIdList[6]);
		await answers.addAnswer("Call friends and chat with them", userIdList[3], questionIdList[6]);
		await answers.addAnswer("Yoga", userIdList[1], questionIdList[6]);
		await answers.addAnswer("I will go to the supermarket and buy groceries", userIdList[2], questionIdList[6]);
		await answers.addAnswer("Jogging", userIdList[5], questionIdList[6]);
		await answers.addAnswer("Watching TV", userIdList[8], questionIdList[6]);
		await answers.addAnswer("Coding, ok, not true all the time.", userIdList[11], questionIdList[6]);
		await answers.addAnswer("Cooking", userIdList[12], questionIdList[6]);
		await answers.addAnswer("Mastering the art of doing nothing", userIdList[13], questionIdList[6]);
		await answers.addAnswer("All bad novels are horrible enough.", userIdList[15], questionIdList[7]);
		await answers.addAnswer("Steven is just best-seller, not the best novelist, this is different.", userIdList[16], questionIdList[7]);
		await answers.addAnswer(" Holiday Pop.", userIdList[19], questionIdList[8]);
		await answers.addAnswer("All I want for Christmas is you.", userIdList[18], questionIdList[8]);
		await answers.addAnswer("Classical.", userIdList[17], questionIdList[8]);
		await answers.addAnswer("Beatles.", userIdList[16], questionIdList[8]);
		await answers.addAnswer("Always Beatles.", userIdList[5], questionIdList[8]);
		await answers.addAnswer("The Beatles.", userIdList[4], questionIdList[8]);
		await answers.addAnswer("Don Mclane.", userIdList[3], questionIdList[8]);
		await answers.addAnswer("Ed Shareen.", userIdList[2], questionIdList[8]);
		await answers.addAnswer("Charlie Puth.", userIdList[1], questionIdList[8]);
		await answers.addAnswer("Justin Beaber-Baby.", userIdList[0], questionIdList[8]);
		await answers.addAnswer("Tatanic.", userIdList[1], questionIdList[9]);
		await answers.addAnswer("Notebook", userIdList[5], questionIdList[9]);
		await answers.addAnswer("Gone with the wind", userIdList[10], questionIdList[9]);
		await answers.addAnswer("The Holiday", userIdList[15], questionIdList[9]);
		await answers.addAnswer("365 Days", userIdList[16], questionIdList[9]);
		await answers.addAnswer("Drink keeps people warm", userIdList[0], questionIdList[10]);
		await answers.addAnswer("When it is cold outside,nothing to do indoors, just drink and sleep.", userIdList[1], questionIdList[10]);
		await answers.addAnswer("You'd better go to a professional training school", userIdList[0], questionIdList[11]);
		await answers.addAnswer("When you came back at home, then you realize that your everyday life is so simple and easy.", userIdList[5], questionIdList[12]);
		await answers.addAnswer("I am here.", userIdList[0], questionIdList[13]);
		await answers.addAnswer("I think Booker Prize is the highest", userIdList[2], questionIdList[14]);
		await answers.addAnswer("Pulizer is only limited in US and mainly for English language, there are tons of master pieces over the world.", userIdList[18], questionIdList[14]);
		await answers.addAnswer("Holiday Pop", userIdList[11], questionIdList[22]);
		await answers.addAnswer("I don't have Prime Music. I prefer YouTube Music.", userIdList[14], questionIdList[22]);
		await answers.addAnswer("Star War Series", userIdList[1], questionIdList[16]);
		await answers.addAnswer("Tatanic", userIdList[10], questionIdList[16]);
		await answers.addAnswer("Gone with the wind", userIdList[15], questionIdList[16]);
		await answers.addAnswer("The Shawshank Redemption", userIdList[16], questionIdList[16]);
		await answers.addAnswer("The Godfather", userIdList[17], questionIdList[16]);



	} catch (error) {
		console.log(error)
	}

	const ansList = await answers.getAllAnswers()
	//Shuffle question time
	try {
		const questionList = await questions.getAllQuestions()
		for (let i = 0; i < questionList.length; i++) {
			const objectId = questionList[i]._id
			let newTime = randomTime('July 20, 2010 00:30:18 GMT+00:00', 'December 02, 2015 00:20:18 GMT+00:00');
			const updatedInfo = await questionsCollection.updateOne({ _id: objectId }, { $set: { questionCreatedTime: newTime } });
			if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
				throw 'seed.js: no time of questions being updated.'
			}
		}
	} catch (error) {
		console.log(error);
	}

	//Shuffle answer time

	let answerIdList = []
	try {

		for (let i = 0; i < ansList.length; i++) {
			//	const objectId = await myDBfunction(questionList[i]._id)
			const objectId = ansList[i]._id;
			answerIdList.push(objectId.toString())
			let newTime = randomTime('July 20, 2015 00:30:18 GMT+00:00', 'December 02, 2018 00:20:18 GMT+00:00');
			const updatedInfo = await answersCollection.updateOne({ _id: objectId }, { $set: { recentUpdatedTime: newTime } });
			if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
				throw 'seed.js: no time of answers being updated.'
			}
		}
	} catch (error) {
		console.log(error);
	}

	//add reviews
	// addReview(content, reviewer, answerId) {
	const reviewsList1 = ["Totally Agree", " I feel the same way", "Well, make sense.", "Nod", "It reminds me of my own experiences.",
		"Nod,nod", "LOL", "Tomato, potato.", "I have no idea.", "You think?", "Not agree.", " Can not agree.", "I don't think so...", "why?",
		"Well, not my type but make sense."]

	try {
		//create 100 reviews
		let round = 100;

		while (round > 0) {
			let userIndex = Math.floor(Math.random() * Math.floor(userIdList.length))
			let answerIndex = Math.floor(Math.random() * Math.floor(ansList.length))
			let reviewIndex = Math.floor(Math.random() * Math.floor(reviewsList1.length))
			const newReview = await reviews.addReview(reviewsList1[reviewIndex], userIdList[userIndex], answerIdList[answerIndex]);

			round--;
		}
	} catch (error) {
		console.log(error);

	}



	//Shuffle review time
	const reviewList = await reviews.getAllReviews()
	let reviewIdList = []
	try {

		for (let i = 0; i < reviewList.length; i++) {
			//	const objectId = await myDBfunction(questionList[i]._id)
			const objectId = reviewList[i]._id;
			reviewIdList.push(objectId.toString())
			let newTime = randomTime('July 20, 2018 01:30:18 GMT+00:00', 'December 02, 2020 00:20:18 GMT+00:00');
			const updatedInfo = await reviewsCollection.updateOne({ _id: objectId }, { $set: { recentUpdatedTime: newTime } });
			if (updatedInfo.matchedCount === 0 || updatedInfo.modifiedCount === 0) {
				throw 'seed.js: no time of reviews being updated.'
			}
		}
	} catch (error) {
		console.log(error);
	}

	//add Voteup and votedown for answers
	let answerIdList2 = answerIdList;

	try {
		for (let i = 0; i < answerIdList2.length; i++) {
			let userIdList2 = userIdList.slice(0, userIdList.length)

			for (let j = 0; j < userIdList2.length; j++) {
				let voteUp = Math.floor(Math.random() * Math.floor(2))
				//	console.log(voteUp)
				if (voteUp) {
					await answers.updateVoteUp(answerIdList2[i], userIdList2[j])
					//await updateMethods.addVoteUpForAnswer(answerIdList2[i], userIdList2[j]);
					userIdList2.splice(j, 1)

				}

			}
			for (let j = 0; j < userIdList2.length; j++) {
				let voteDown = Math.floor(Math.random() * Math.floor(2))
				//	console.log(voteDown)
				if (voteDown) {
					await answers.updateVoteDown(answerIdList2[i], userIdList2[j]);
					//	await updateMethods.addVoteDownForAnswer(answerIdList2[i], userIdList2[j]);
					userIdList2.splice(j, 1)

				}

			}

		}


	} catch (error) {
		console.log(error)
	}

	//add Voteup and votedown for reviews

	let reviewIdList2 = reviewIdList;
	try {
		for (let i = 0; i < reviewIdList2.length; i++) {
			let userIdList2 = userIdList.slice(0, userIdList.length)
			for (let j = 0; j < userIdList2.length; j++) {
				let voteUp = Math.floor(Math.random() * Math.floor(2))
				if (voteUp) {
					await reviews.updateVoteUp(reviewIdList2[i], userIdList2[j])
					//await updateMethods.addVoteUpForReview(reviewIdList2[i], userIdList2[j]);
					userIdList2.splice(j, 1)

				}

			}
			for (let j = 0; j < userIdList2.length; j++) {
				let voteDown = Math.floor(Math.random() * Math.floor(2))
				if (voteDown) {
					await reviews.updateVoteDown(reviewIdList2[i], userIdList2[j]);
					//	await updateMethods.addVoteDownForReview(reviewIdList2[i], userIdList2[j]);
					userIdList2.splice(j, 1)

				}

			}

		}


	} catch (error) {
		console.log(error)
	}



	console.log('Done seeding database');

	await db.serverConfig.close();
};

main().catch(console.log);

module.exports = main;
