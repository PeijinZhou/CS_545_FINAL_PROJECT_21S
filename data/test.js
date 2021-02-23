
const reviewsMethods = require("./reviews");
const questionsdMethods = require("./questions");
const usersdMethods = require("./users");
const answersMethods = require("./answers");
const usersMethods = require("./users");
async function test1() {
    try {
        const op1 = await reviewsMethods.getReviewById("5fd2bcbadc020240556f3b05");
        console.log(op1);
    } catch (error) {
        throw error
    }
    // console.log("-----///----///---///");
    // try {
    //     const op2 = await reviewsMethods.getReviewById("5fb5cd906768a33e948daf2d");
    //     // const test=await reviewsMethods.getAllReviews()
    //     console.log(op2);
    // } catch (error) {
    //     throw error
    // }
}
async function test2() {
    const getAll = await questionsdMethods.getAllQuestions()
    console.log(getAll);
    console.log("-----///----///---///");
    try {
        const getOne = await questionsdMethods.getQuestionById("5fb5cd906768a33e948daf2");
        console.log(getOne);
    } catch (error) {
        throw error
    }
    console.log("-----///----///---///");
    try {
        const getOne = await questionsdMethods.getQuestionById("5fb5cd906768a33e948daf2b");
        console.log(getOne);
    } catch (error) {
        throw error
    }
}
async function createDate() {
    const da = new Date();
    console.log(da);
}
/**
 * addReview
 */
async function test3() {
    await reviewsMethods.addReview("test", "5fb5cd906768a33e948daf29", "5fb5cd906768a33e948daf2c");
}
/**
 * updateReview
 */
async function test4() {
    const newDate = await reviewsMethods.updateReview("5fb73445e7ad9c8684f559bb", "this is a new review");
    console.log(newDate);
}
/**
 * updateVoteUp
 */
async function test5() {
    console.log(await reviewsMethods.updateVoteUp("5fb73445e7ad9c8684f559bb", "5fb73445e7ad9c8684f559b7"));
}

async function test6() {
    console.log(await usersdMethods.getUserById("5fd159ca2edebd22d81c39eb"));
}

/**
 * updateVoteDown
 */
async function test7() {
    console.log(await reviewsMethods.updateVoteDown("5fb73445e7ad9c8684f559bb", "5fb73445e7ad9c8684f559b7"));
}

async function test8() {
    console.log(await answersMethods.getAllAnswers());
}
/**
 * getAllUsers
 */
async function test9() {
    console.log(await usersMethods.getAllUsers());
}

async function test10() {
    try {
        console.log(await answersMethods.addAnswer('test add ansewer', "5fd06366682082112a521508", "5fd06366682082112a52151b"));
    } catch (error) {
        throw error
    }
}
async function test11() {
    // console.log(await answersMethods.getAnswerById('5fd159ca2edebd22d81c3a26'));
    // console.log(await answersMethods.addAnswer("test answer vote down","5fd159ca2edebd22d81c39eb","5fd159ca2edebd22d81c39ff"));
    // await answersMethods.removeAnswer("5fd2a367565d903758198dfe","5fd159ca2edebd22d81c39eb","5fd159ca2edebd22d81c39ff")
   console.log( await answersMethods.updateVoteUp("5fd2bcbadc020240556f3aca","5fd2bcbadc020240556f3a8e"));
   console.log(await reviewsMethods.updateVoteUp("5fd2bcbadc020240556f3b06","5fd2bcbadc020240556f3a8e"));
}

async function test12() {
    // console.log(await reviewsMethods.getAllReviews());
    // console.log("/////--//////////////---/////////");
    // console.log(await reviewsMethods.getReviewById('5fd1557d04a52f20a62f11bf'));
    // console.log("/////--//////////////---/////////");
    console.log(await reviewsMethods.updateReview('5fd159ca2edebd22d81c3a64', 'this is second new review'));
    console.log("/////--//////////////---/////////");
    console.log(await usersdMethods.getUserById("5fd159ca2edebd22d81c39ec"));
    console.log("/////--//////////////---/////////");
    console.log(await reviewsMethods.updateVoteUp('5fd159ca2edebd22d81c3a64', '5fd159ca2edebd22d81c39ec'));
    
}

async function test13() {
    // console.log(await reviewsMethods.addReview("new review","5fd159ca2edebd22d81c39eb","5fd2a6cc321e0739a65fac60"));
    await reviewsMethods.removeReview("5fd2a8ced8cba33b4f3341cc","5fd159ca2edebd22d81c39eb","5fd2a6cc321e0739a65fac60","5fd159ca2edebd22d81c39ff");
}


async function test14(){
    const reviewList=await reviewsMethods.getAllReviews();
    // console.log(await reviewsMethods.sortReviewsByTime(reviewList,-1));
    console.log(await reviewsMethods.sortReviewsByVote(reviewList,-1));
}

async function test15(){
    const ansList=await answersMethods.getAllAnswers();
    // console.log(await answersMethods.sortAnswersByVote(ansList,-1));
    console.log(await answersMethods.sortAnswersByTime(ansList,-1));
}

async function test16(){
    // console.log(await questionsdMethods.getAllQuestions());
    console.log(await reviewsMethods.judgeVoteUpInReviews("5fd2bcbadc020240556f3a8e","5fd2bcbadc020240556f3b06"));
    console.log(await reviewsMethods.judgeVoteUpInReviews("5fd2bcbadc020240556f3a91","5fd2bcbadc020240556f3b06"));

}
async function test17(){
    try{
        const data = await usersdMethods.changPassword("5fd85e72e91c61bfb8d9337c","qwe123","Qwe123")
        console.log(data);
        console.log("1");
    }
  catch(error){
    console.log(error)
  }
}
async function test18(){
    try{
        const data = await usersdMethods.setPassword("5fd85e72e91c61bfb8d9337c","qwe123")
        console.log(data);
        console.log("1");
    }
  catch(error){
    console.log(error)
  }
}
async function test19(){
    try{
        const data = await usersdMethods.checkPassword("test1@test.com","qqwe123")
        console.log(data);
        console.log("1");
    }
  catch(error){
    console.log(error)
  }
}
test19();


