const user = require('./users')
const answers = require('./answers')
const reviews = require('./reviews')
const { getAllUsers } = require('./users');
const { getAnswerById } = require('./answers');
const { getReviewById } = require('./reviews');
let exportedMethods = {
    async getAllUserVoteList(){
        let topList =[];
        let sortList=[];
        let alluser =await getAllUsers();
        for(let i=0;i<alluser.length;i++){
            let userGetVote=0;
            userName =alluser[i].userName;
            userAnswer = alluser[i].answers;
            userReviews = alluser[i].reviews;
            if(!userAnswer.length){}
            else{
                for(let j=0;j<userAnswer.length;j++){
                    let userEachAnswer=await getAnswerById(userAnswer[j]);
                    if(!userEachAnswer|| !userEachAnswer.voteUp|| !userEachAnswer.voteDown){

                    }
                    else{
                        userGetVote=userGetVote+ userEachAnswer.voteUp.length-userEachAnswer.voteDown.length;
                    }
                }
            }
            if(!userReviews){}
            else{
                for(let l=0;l<userReviews.length;l++){
                    let userEachReview = await getReviewById(userReviews[l]);
                    if(!userEachReview|| !userEachReview.voteUp || !userEachReview.voteDown){}
                    else{    
                        userGetVote=userGetVote+ userEachReview.voteUp.length-userEachReview.voteDown.length;
                    }
                }
            }
            let voteObject ={userName:userName,userGetVote:userGetVote};
            if(topList.length<10){
                topList.push(voteObject)
                sortList = topList.sort(compare("userGetVote"));
            }
            
            else{
                for(let i=9;i>=0;i=i-1){
                    if(sortList[i].userGetVote<userGetVote){
                        sortList[i]=voteObject
                        break;
                    }
                }
            }
            
        }
        return sortList
    } 
}
function compare(property){
    return function(obj1,obj2){
        var value1 = obj1[property];
        var value2 = obj2[property];
        return value1 - value2;     
    }
}

module.exports = exportedMethods;