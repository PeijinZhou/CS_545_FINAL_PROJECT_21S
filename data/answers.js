const e = require('express');
const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const answers = mongoCollections.answers;
const reviews = mongoCollections.reviews;
const usrs = mongoCollections.users;
const questionsMethods = require('./questions')
const usersMethods = require("./users");

let exportedMethods = {

    async getAllAnswers() {
        const answersCollection = await answers();
        const answersList = await answersCollection.find({}).toArray();
        return answersList;
    },
    async getAnswerById(id) {
        if (!id || id == null || typeof id != 'string' || id.match(/^[ ]*$/)) {
            throw `id of /data/answers.js/getAnswerById is not String or legal input`
        }
        const answersCollection = await answers();
        try {
            const answerById = await answersCollection.findOne({ _id: ObjectId(id) });
            return answerById;
        } catch (error) {
            throw `there is an error in /data/answers.js/getAnswerById`
        }
    },
    async addAnswer(content, answerer, questionId) {
        //check whether AnswerName duplicated
        //generate recentUpdatedTime
        //generate empty arryays for reviews voteUp voteDown
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!content || content == null || typeof content != 'string' || content.match(/^[ ]*$/)) {
            throw `content in /data/answers.js/addAnswer is blank`
        }
        if (!answerer || answerer == null || typeof answerer != 'string' || answerer.match(/^[ ]*$/) || !ObjectIdExp.test(answerer)) {
            throw `answerer in /data/answers.js/addAnswer is blank or not match Object`
        }
        if (!questionId || questionId == null || typeof questionId != 'string' || questionId.match(/^[ ]*$/) || !ObjectIdExp.test(questionId)) {
            throw `questionId in /data/answers.js/addAnswer has error`
        }
        try {
            try {
                await questionsMethods.getQuestionById(questionId)
            } catch (error) {
                throw `didn't find question in answer/addAnswer`
            }
            const realDate = new Date()
            let voteUpArr = []
            let voteDownArr = []
            let reviewsArr = []
            const newAnswer = {
                content: content,
                recentUpdatedTime: realDate,
                answerer: answerer,
                questionId: questionId,
                reviews: reviewsArr,
                voteUp: voteUpArr,
                voteDown: voteDownArr
            }
            const answersCollection = await answers();
            const insertInfor = await answersCollection.insertOne(newAnswer);
            if (insertInfor.insertedCount === 0) {
                throw 'Insert failed!';
            }
            const newId = insertInfor.insertedId.toString();
            // add answer to question
            const answerAddedInQus = await questionsMethods.addAnswer(questionId, newId)
            if (answerAddedInQus == null) {
                return null
            }
            //update user
            try {
                const answerAddedInUsr = await usersMethods.addAnswer(answerer, newId)
                if (answerAddedInUsr == null) {
                    return null
                }
            } catch (error) {
                throw error
            }
            const ans = await this.getAnswerById(newId);
            return ans

        } catch (error) {
            throw error
        }
    },
    async removeAnswer(id, userId, questionId) {
        //also remove comments related to the Answer. 
        try {
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!id || id == null || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
                throw `id in /data/answers.js/removeAnswer is blank or not match Object`
            }
            if (!userId || userId == null || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
                throw `userId in /data/answers.js/removeAnswer is blank or not match Object`
            }
            if (!questionId || questionId == null || typeof questionId != 'string' || questionId.match(/^[ ]*$/) || !ObjectIdExp.test(questionId)) {
                throw `questionId in /data/answers.js/removeAnswer is blank or not match Object`
            }
            const answer = await this.getAnswerById(id)
            if (answer == null) {
                return null
            }
            let reviewArray = answer.reviews
            const reviewsCollection = await reviews();
            for (let i = 0; i < reviewArray.length; i++) {
                let rewId = reviewArray[i]
                let curRewDeletedInReview = await reviewsCollection.deleteOne({ _id: ObjectId(rewId) });
                if (curRewDeletedInReview.deletedCount === 0) {
                    throw `Failed to delete review by id ${rewId} in answer/removeAnswer`
                }
                //update user review
                let curRewDeletedInUsr = await usersMethods.removeReview(userId, rewId)
                if (curRewDeletedInUsr == null) {
                    // throw `Failed to update user by deleting review by id ${rewId} in answer/removeAnswer`
                    return null
                }
            }
            //delete answer
            const answersCollection = await answers()
            let answerDeleted = await answersCollection.deleteOne({ _id: ObjectId(id) });
            if (answerDeleted.deletedCount === 0) {
                throw `Failed to delete answer by id ${id} in answer/removeAnswer`
            }
            //update user answer
            let curAnsDeletedInUsr = await usersMethods.removeAnswer(userId, id)
            if (curAnsDeletedInUsr == null) {
                // throw `Failed to update answer by deleting review by id ${rewId} in answer/removeAnswer`
                return null
            }
            //update question
            let curRewDeletedInQus = await questionsMethods.removeAnswer(questionId, id)
            if (curRewDeletedInQus == null) {
                // throw `Failed to update question by deleting review by id ${rewId} in answer/removeAnswer`
                return null
            }
        } catch (error) {
            throw error
        }
    },

    async updateAnswer(id, content) {
        try {
            const answersCollection = await answers()
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!id || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
                throw `id in /data/answer.js/updateAnswer has error`
            }
            if (!content || content == null || typeof content != 'string' || content.match(/^[ ]*$/)) {
                throw `content in /data/answer.js/updateAnswer is blank`
            }
            const oldAns = await this.getAnswerById(id)
            if (oldAns == null) {
                throw `didn't find answer by id : ${id}`
            }
            try {
                await answersCollection.updateOne({ _id: ObjectId(id) }, { $set: { 'content': content } });
                const newData = await this.getAnswerById(id)
                return newData
            } catch (error) {
                throw 'could not update answer successfully';
            }
        } catch (error) {
            throw error
        }
    },
    /**
     * 
     * @param {*} id : id of answer
     * @param {*} reviewId 
     * add a new review id to answer.reviews array
     */
    async addReview(id, reviewId) {
        try {
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
                throw `reviewId in /data/answer.js/addReview has error`
            }
            if (!id || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
                throw `id in /data/answer.js/addReview has error`
            }
            const answersCollection = await answers()
            const updateInfo = await answersCollection.updateOne({ _id: ObjectId(id) }, { $addToSet: { reviews: reviewId } })
            if (updateInfo.matchedCount === 0) {
                throw `did not find answer by id ${id} in answer.js/addReview`
            }
            if (updateInfo.modifiedCount === 0) {
                throw `failed to update answer by adding review in answer.js/addReview`
            }
            const updatedAnswer = await this.getAnswerById(id);
            return updatedAnswer;
        } catch (error) {
            throw error
        }
    },
    async removeReview(id, reviewId) {
        try {
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
                throw `reviewId in /data/answer.js/removeReview has error`
            }
            if (!id || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
                throw `id in /data/answer.js/removeReview has error`
            }
            const answersCollection = await answers()
            const updateInfo = await answersCollection.updateOne({ _id: ObjectId(id) }, { $pull: { reviews: reviewId } })
            if (updateInfo.matchedCount === 0) {
                throw `did not find answer by id ${id} in answer.js/removeReview`
            }
            if (updateInfo.modifiedCount === 0) {
                throw `failed to update answer by adding review in answer.js/removeReview`
            }
            const updatedAnswer = await this.getAnswerById(id);
            return updatedAnswer;
        } catch (error) {
            throw error
        }
    },

    async updateVoteUp(answerId, voterId) {
        try {
            const answersCollection = await answers()
            const usrsCollection = await usrs()
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!answerId || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
                throw `answerId in /data/answers.js/updateVoteDown has error`
            }
            if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
                throw `voterId in /data/answers.js/updateVoteDown has error`
            }
            const ans = await this.getAnswerById(answerId)
            let voteUpArr = ans.voteUp
            if (voteUpArr.indexOf(voterId) == -1) {
                // add voter id in answer
                const updateInfo = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $addToSet: { voteUp: voterId } })
                if (updateInfo.modifiedCount === 0) {
                    throw `failed to update voteUpArr in answer by adding voter in answers.js/updateVoteUp`
                }
                // find the people already vote down
                if (await this.judgeVoteDownInAnswers(voterId, answerId)) {
                    const removeFromVoteDown = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $pull: { voteDown: voterId } })
                    if (removeFromVoteDown.modifiedCount === 0) {
                        throw `failed to update voteDown in answer by removing voter id in voteDown in answer.js/updateVoteUp`
                    }
                    //update user
                    await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForAnswers: answerId } })
                }
                //add answer id in user votedForAnswers
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $addToSet: { votedForAnswers: answerId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForAnswers in user by adding voter in answer.js/updateVoteUp`
                }
            } else {
                // delete voter id in answer
                const updateInfo = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $pull: { voteUp: voterId } })
                if (updateInfo.modifiedCount === 0) {
                    throw `failed to update voteUpArr by deleting voter in answers.js/updateVoteUp`
                }
                //delete answer id in user votedForAnswers
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForAnswers: answerId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForAnswers in user by deleting voter in answer.js/updateVoteUp`
                }
            }
            const updatedAnswer = await this.getAnswerById(answerId);
            return updatedAnswer;
        } catch (error) {
            throw error
        }
    },

    async updateVoteDown(answerId, voterId) {
        try {
            const answersCollection = await answers()
            const usrsCollection = await usrs()
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            if (!answerId || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
                throw `answerId in /data/answer.js/updateVoteDown has error`
            }
            if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
                throw `voterId in /data/answer.js/updateVoteDown has error`
            }
            const ans = await this.getAnswerById(answerId)
            let voteDownArr = ans.voteDown
            if (voteDownArr.indexOf(voterId) == -1) {
                // add vote
                const updateInfo = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $addToSet: { voteDown: voterId } })
                if (updateInfo.modifiedCount === 0) {
                    throw `failed to update voteDownArr by adding voter in answer.js/updateVoteUp`
                }
                // find the people already vote voteup
                if (await this.judgeVoteUpInAnswers(voterId, answerId)) {
                    const removeFromVoteUp = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $pull: { voteUp: voterId } })
                    if (removeFromVoteUp.modifiedCount === 0) {
                        throw `failed to update voteDown in answer by removing voter id in voteUp in answer.js/updateVoteDown`
                    }
                    //update user
                    await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForAnswers: answerId } })
                }
                //add answer id in user votedForAnswers
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $addToSet: { votedForAnswers: answerId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForAnswers in user by adding voter in answer.js/updateVoteDown`
                }
            } else {
                // delete it from array
                const updateInfo = await answersCollection.updateOne({ _id: ObjectId(answerId) }, { $pull: { voteDown: voterId } })
                if (updateInfo.modifiedCount === 0) {
                    throw `failed to update voteDownArr by deleting voter in answer.js/updateVoteUp`
                }
                //delete answer id in user votedForAnswers
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForAnswers: answerId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForAnswers in user by deleting voter in answer.js/updateVoteUp`
                }
            }
            const updatedAnswer = await this.getAnswerById(answerId);
            return updatedAnswer;
        } catch (error) {
            throw error
        }
    },

    /**
     * 
     * @param {*} answersList 
     * @param {*} limit 
     */
    async sortAnswersByVote(answersList, limit) {
        if (!answersList) throw 'answer.js|sortAnswersByVote: answersList does not exist'
        if (!Array.isArray(answersList) || answersList.length === 0) throw 'answer.js|sortAnswersByVote: input answersList should be non-empty array'
        if (typeof limit === 'undefined') throw 'answer.js|sortAnswersByVote: limit number does not exist'
        if (typeof limit !== 'number') throw 'answer.js|sortAnswersByVote:limit is a number'
        if (answersList.length >= 2) {
            answersList.sort(function compare(a, b) {
                let x = a.voteUp.length - a.voteDown.length;
                let y = b.voteUp.length - b.voteDown.length
                return y - x;
            })
            if (answersList.length >= limit && limit >= 0) {
                let result = answersList.slice(0, limit);
                return result
            }
        }
        return answersList;
    },

    async sortAnswersByTime(answersList, limit) {
        if (!answersList) throw 'answer.js|sortAnswersByTime: answersList does not exist'
        if (!Array.isArray(answersList) || answersList.length === 0) throw 'answer.js|sortAnswersByTime: input answersList should be non-empty array'
        if (typeof limit === 'undefined') throw 'answer.js|sortAnswersByTime: limit number does not exist'
        if (typeof limit !== 'number') throw 'answer.js|sortAnswersByTime:limit is a number'
        if (answersList.length >= 2) {
            answersList.sort(function compare(a, b) {
                let x = new Date(a.recentUpdatedTime);
                let y = new Date(b.recentUpdatedTime)
                return y - x;
            })
            if (answersList.length >= limit && limit >= 0) {
                let result = answersList.slice(0, limit);
                return result
            }
        }
        return answersList;
    },

    async judgeVoteDownInAnswers(userId, answerId) {
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!answerId || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
            throw `reviewId in /data/answer.js/judgeVoteDownInAnswers has error`
        }
        if (!userId || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
            throw `userId in /data/answer.js/judgeVoteDownInAnswers has error`
        }
        const answer = await this.getAnswerById(answerId)
        if (answer == null) {
            throw `didn't find answer by id : ${answerId} in /data/answer.js/judgeVoteDownInAnswers`
        }
        const voteDownInAnswer = answer.voteDown
        if (voteDownInAnswer.indexOf(userId) == -1) {
            return false
        } else {
            return true
        }
    },

    async judgeVoteUpInAnswers(userId, answerId) {
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!answerId || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
            throw `answerId in /data/answer.js/judgeVoteUpInAnswers has error`
        }
        if (!userId || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
            throw `userId in /data/answer.js/judgeVoteUpInAnswers has error`
        }
        const answer = await this.getAnswerById(answerId)
        if (answer == null) {
            throw `didn't find answer by id : ${answerId} in /data/answer.js/judgeVoteUpInAnswers`
        }
        const voteUpInAnswer = answer.voteUp
        if (voteUpInAnswer.indexOf(userId) == -1) {
            return false
        } else {
            return true
        }
    },

    async transferData(data) {
        var s;
        var month = data.getMonth() + 1
        var day = data.getDate()
        var year = data.getFullYear()
        var s = month + "/" + day + "/" + year
        return s
    }
};

module.exports = exportedMethods;