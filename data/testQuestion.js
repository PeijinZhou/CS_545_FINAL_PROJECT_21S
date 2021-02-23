const questionData = require('./questions')
async function main(){
try {
	//const questionList = await questionData.getQuestionsByKeywords("best what")
	//console.log(questionList)
//
//	const ql2 = await questionData.getQuestionsByTopic("Books")
//	console.log(ql2)
////
//	console.log("-----ql3--------------")
//	const ql3 = await questionData.sortQuestionsByTime(ql2,20)
//	console.log(ql3)
//	console.log(ql3.length)
//
//
//	console.log("-----ql4--------------")
//	const ql4 = await questionData.sortQuestionsByAnsNum(ql2,-5)
//	console.log(ql4)
//	console.log(ql4.length)

//	const q16 = await questionData.getQuestionsByKeywordsAndTopic("is","Books")
//	console.log(q16)
//	console.log(q16.length)
//
//	const q17 = await questionData.getQuestionsByKeywords("what 2020")
//	console.log(q17)
//	console.log(q17.length)

	const q = await questionData.getQuestionById("5fd96b9f86115d535cb9526e")
	console.log(q)
	const remove = await questionData.removeQuestion("5fd96b9f86115d535cb9526e")
	console.log(remove)

	//const update= await questionData.updateQuestion("5fd7ad929abeab4208ea0ec3","What is best non-fiction movie of 2020?","Movies")
	//console.log(update)
} catch (error) {
	console.log(error)
}
}
main()