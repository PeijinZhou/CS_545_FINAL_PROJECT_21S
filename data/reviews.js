const mongoCollections = require('../config/mongoCollections');
const reviews = mongoCollections.reviews;
const usersMethods = require("./users");
const answersdMethods = require("./answers");
const questionMethods = require("./questions");
const usrs = mongoCollections.users;
const ObjectId = require('mongodb').ObjectId;


let exportedMethods = {
    /**
     * get all reviews from reviews table as Array
     */
    async getAllReviews() {
        const reviewsCollection = await reviews();
        const reviewsList = await reviewsCollection.find({}).toArray();
        return reviewsList;
    },
    /**
     * 
     * @param {*} id 
     * return a review as document by id in review table
     * return null if did't find result
     */
    async getReviewById(id) {
        if (!id || id == null || typeof id != 'string' || id.match(/^[ ]*$/)) {
            throw `id of /data/reviews.js/getReviewById is not String or legal input`
        }
        const reviewsCollection = await reviews();
        try {
            const reviewById = await reviewsCollection.findOne({ _id: ObjectId(id) });
            return reviewById;
        } catch (error) {
            throw `there is an error in /data/questions.js/getReviewById`
        }
    },
    /**
     * 
     * @param {*} content : the contene of review
     * @param {*} reviewer : the id of the user who write this review
     * @param {*} answerId : the id of the question be reviewed
     * check whether ReviewName duplicated
     * generate recentUpdatedTime(UTC)
     * generate empty arryays for reviews voteUp voteDown
     */
    async addReview(content, reviewer, answerId) {
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!content || content == null || typeof content != 'string' || content.match(/^[ ]*$/)) {
            throw `content in /data/reviews.js/addReview is blank`
        }
        if (!reviewer || reviewer == null || typeof reviewer != 'string' || reviewer.match(/^[ ]*$/) || !ObjectIdExp.test(reviewer)) {
            throw `reviewer in /data/reviews.js/addReview is blank or not match Object`
        }
        if (!answerId || answerId == null || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
            throw `answerId in /data/reviews.js/addReview has error`
        }
        try {
            if (answersdMethods.getAnswerById(answerId) == null) {
                throw `did not find answer by id ${answerId} in reviews/addReview`
            }
            const realDate = new Date()
            let voteUpArr = []
            let voteDownArr = []
            const newReview = {
                content: content,
                recentUpdatedTime: realDate,
                reviewer: reviewer,
                answerId: answerId,
                voteUp: voteUpArr,
                voteDown: voteDownArr
            }
            const reviewsCollection = await reviews();
            const insertInfor = await reviewsCollection.insertOne(newReview);
            if (insertInfor.insertedCount === 0) {
                throw 'Insert failed!';
            }
            const newId = insertInfor.insertedId.toString();
            //upadte answer
            const ansAndRev = await answersdMethods.addReview(answerId, newId);
            if (ansAndRev == null) {
                throw 'Insert failed!';
            }
            //update user (reviewer)
            const usrUpdate = await usersMethods.addReview(reviewer, newId)
            const review = await this.getReviewById(newId);
            return review
        } catch (error) {
            throw error
        }
    },
    /**
     * 
     * @param {*} id 
     * @param {*} userId 
     * @param {*} answerId 
     * @param {*} questionId 
     */
    async removeReview(id, userId, answerId, questionId) {
        try {
            var ObjectIdExp = /^[0-9a-fA-F]{24}$/
            const reviewsCollection = await reviews();
            if (!id || id == null || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
                throw `id in /data/reviews.js/removeReview has error`
            }
            if (!userId || userId == null || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
                throw `userId in /data/reviews.js/removeReview has error`
            }
            if (!answerId || answerId == null || typeof answerId != 'string' || answerId.match(/^[ ]*$/) || !ObjectIdExp.test(answerId)) {
                throw `answerId in /data/reviews.js/removeReview has error`
            }
            if (!questionId || questionId == null || typeof questionId != 'string' || questionId.match(/^[ ]*$/) || !ObjectIdExp.test(questionId)) {
                throw `questionId in /data/reviews.js/removeReview has error`
            }
            const rev = await this.getReviewById(id);
            if (rev != null) {
                const deletionInfo = await reviewsCollection.deleteOne({ _id: ObjectId(id) });
                if (deletionInfo.deletedCount === 0) {
                    throw `Could not delete book with id of ${id}`;
                }
                //update answer
                const ansUpdate = await answersdMethods.removeReview(answerId, id)
                if (ansUpdate == null) {
                    throw `answer updated failed in reviews.js/removeReview`
                }
                //update user
                const usrUpdate = await usersMethods.removeReview(userId, id)
                if (usrUpdate == null) {
                    throw `user updated failed in reviews.js/removeReview`
                }
            } else {
                throw `did not find review by id ${id} in reviews/removeReview`
            }
        } catch (error) {
            throw error
        }
    },

    /**
     * 
     * @param {*} id : id of the review
     * @param {*} content : update the content
     */
    async updateReview(id, content) {
        const reviewsCollection = await reviews();
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!id || typeof id != 'string' || id.match(/^[ ]*$/) || !ObjectIdExp.test(id)) {
            throw `id in /data/reviews.js/updateReview has error`
        }
        if (!content || content == null || typeof content != 'string' || content.match(/^[ ]*$/)) {
            throw `content in /data/reviews.js/updateReview is blank`
        }
        try {
            const oldReview = await this.getReviewById(id)
            if (oldReview == null) {
                throw `didn't find review by id : ${id}`
            }

            try {
                await reviewsCollection.updateOne({ _id: ObjectId(id) }, { $set: { 'content': content } });
                const newData = await this.getReviewById(id)
                return newData
            } catch (error) {
                throw 'could not update review successfully';
            }
        } catch (error) {
            throw error
        }
    },
    /**
     * 
     * @param {*} reviewId : id of review
     * @param {*} voterId : id of the voter
     * when this function used, if the user already "vote up" this review, then delete it, or add it if the user didn't "vote up " the review 
     */
    async updateVoteUp(reviewId, voterId) {
        const usrsCollection = await usrs()
        const reviewsCollection = await reviews();
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
            throw `reviewId in /data/reviews.js/updateVoteUp has error`
        }
        if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
            throw `voterId in /data/reviews.js/updateVoteUp has error`
        }
        const review = await this.getReviewById(reviewId)
        if (review == null) {
            throw `didn't find review by id : ${reviewId}`
        }
        const voter = await usersMethods.getUserById(voterId)
        if (voter == null) {
            throw `didn't find user by id : ${voterId}`
        }
        try {
            let voterArr = review.voteUp
            if (voterArr.indexOf(voterId) == -1) {
                const addItTomArray = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$addToSet:{voteUp:voterId}})
                if (addItTomArray.modifiedCount === 0) {
                    throw `failed to update voteDown in user by adding voter in reviews.js/updateVoteUp`
                }
                 // find the people already vote voteDown
                 if(await this.judgeVoteDownInReviews(voterId,reviewId)){
                    const removeFromVoteDown = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$pull:{voteDown:voterId}})
                    if (removeFromVoteDown.modifiedCount === 0) {
                        throw `failed to update voteDown in review by removing voter id in voteDown in reviews.js/updateVoteUp`
                    }
                    //update user
                    await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForReviews: reviewId } })
                }
                //add voter id in user/votedForReview 
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $addToSet: { votedForReviews: reviewId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForReview in user by adding voter in reviews.js/updateVoteUp`
                }
            } else {
                const deleItFromArray = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$pull:{voteDown:voterId}})
                if (deleItFromArray.modifiedCount === 0) {
                    throw `failed to update voteDown in user by deleting voter in reviews.js/updateVoteUp`
                }
                //delete voter id in user/votedForReview 
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForReviews: reviewId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForReview in user by deleting voter in reviews.js/updateVoteUp`
                }
            }
            const newData = await this.getReviewById(reviewId)
            return newData
        } catch (error) {
            throw error
        }
    },

    /**
     * 
     * @param {*} reviewId 
     * @param {*} voterId 
     * change the voteDown status
     */
    async updateVoteDown(reviewId, voterId) {
        const reviewsCollection = await reviews();
        const usrsCollection=await usrs()
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
            throw `reviewId in /data/reviews.js/updateVoteDown has error`
        }
        if (!voterId || typeof voterId != 'string' || voterId.match(/^[ ]*$/) || !ObjectIdExp.test(voterId)) {
            throw `voterId in /data/reviews.js/updateVoteDown has error`
        }
        const review = await this.getReviewById(reviewId)
        if (review == null) {
            throw `didn't find review by id : ${reviewId}`
        }
        const voter = await usersMethods.getUserById(voterId)
        if (voter == null) {
            throw `didn't find user by id : ${voterId}`
        }
        try {
            let voterArr = review.voteDown
            if (voterArr.indexOf(voterId) == -1) {
                const addItTomArray = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$addToSet:{voteDown:voterId}})
                if (addItTomArray.modifiedCount === 0) {
                    throw `failed to update voteDown in user by adding voter in reviews.js/updateVoteDown`
                }
                // find the people already vote voteup
                if(await this.judgeVoteUpInReviews(voterId,reviewId)){
                    const removeFromVoteUp = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$pull:{voteUp:voterId}})
                    if (removeFromVoteUp.modifiedCount === 0) {
                        throw `failed to update voteDown in review by removing voter id in voteUp in reviews.js/updateVoteDown`
                    }
                    //update user
                    await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForReviews: reviewId } })
                }
                //add voter id in user/votedForReview 
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $addToSet: { votedForReviews: reviewId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForReview in user by adding voter in reviews.js/updateVoteDown`
                }
            } else {
                const deleItFromArray = await reviewsCollection.updateOne({ _id: ObjectId(reviewId) },{$pull:{voteDown:voterId}})
                if (deleItFromArray.modifiedCount === 0) {
                    throw `failed to update voteDown in user by deleting voter in reviews.js/updateVoteDown`
                }
                //delete voter id in user/votedForReview 
                const voteInUser = await usrsCollection.updateOne({ _id: ObjectId(voterId) }, { $pull: { votedForReviews: reviewId } })
                if (voteInUser.modifiedCount === 0) {
                    throw `failed to update votedForReview in user by deleting voter in reviews.js/updateVoteDown`
                }
            }
            const newData = await this.getReviewById(reviewId)
            return newData
        } catch (error) {
            throw error
        }
    },

    /**
     * 
     * @param {*} reviewList 
     * @param {*} limit 
     */
    async sortReviewsByTime(reviewList,limit){
        if(!reviewList) throw 'reviewList.js|sortReviewsByTime: reviewList does not exist'
		if(!Array.isArray(reviewList) || reviewList.length === 0) throw 'reviews.js|sortReviewsByTime: input reviewList should be non-empty array'
		if(typeof limit === 'undefined') throw 'reviews.js|sortReviewsByTime: limit number does not exist'
        if(typeof limit !== 'number' ) throw 'reviews.js|sortReviewsByTime:limit is a number'
        if(reviewList.length >=2){
			reviewList.sort(function compare(a,b){
				let x = new Date(a.recentUpdatedTime);
				let y = new Date(b.recentUpdatedTime)
				return y - x;
			})
			if(reviewList.length >= limit && limit >= 0){
				let result = reviewList.slice(0,limit);
				return result
			}

		}
		return reviewList;
    },

    /**
     * 
     * @param {*} reviewList 
     * @param {*} limit 
     * return reviewlist from most upvoted-downvoted
     */
    async sortReviewsByVote(reviewList,limit){
        if(!reviewList) throw 'reviews.js|sortReviewsByVote: reviewList does not exist'
		if(!Array.isArray(reviewList) || reviewList.length === 0) throw 'reviews.js|sortReviewsByVote: input reviewList should be non-empty array'
		if(typeof limit === 'undefined') throw 'reviews.js|sortReviewsByVote: limit number does not exist'
        if(typeof limit !== 'number' ) throw 'reviews.js|sortReviewsByVote:limit is a number'
        if(reviewList.length >=2){
			reviewList.sort(function compare(a,b){
				let x = a.voteUp.length-a.voteDown.length;
				let y = b.voteUp.length-b.voteDown.length
				return y - x;
			})
			if(reviewList.length >= limit && limit >= 0){
				let result = reviewList.slice(0,limit);
				return result
			}

		}
		return reviewList;
    },

    
    /**
     * 
     * @param {*} userId 
     * @param {*} reviewId 
     * * return true if find user vote up in review by id reviewId,
     * else return false
     */
    async judgeVoteUpInReviews(userId,reviewId){
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
            throw `reviewId in /data/reviews.js/judgeVoteUpInReviews has error`
        }
        if (!userId || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
            throw `userId in /data/reviews.js/judgeVoteUpInReviews has error`
        }
        const review=await this.getReviewById(reviewId)
        if(review==null){
            throw `didn't find review by id : ${reviewId} in /data/reviews.js/judgeVoteUpInReviews  `
        }
        const voteUpInReview=review.voteUp
        if(voteUpInReview.indexOf(userId)==-1){
            return false
        }else{
            return true
        }
    },

    /**
     * 
     * @param {*} userId 
     * @param {*} reviewId 
     * return true if find user vote down in review by id reviewId,
     * else return false
     */
    async judgeVoteDownInReviews(userId,reviewId){
        var ObjectIdExp = /^[0-9a-fA-F]{24}$/
        if (!reviewId || typeof reviewId != 'string' || reviewId.match(/^[ ]*$/) || !ObjectIdExp.test(reviewId)) {
            throw `reviewId in /data/reviews.js/judgeVoteDownInReviews has error`
        }
        if (!userId || typeof userId != 'string' || userId.match(/^[ ]*$/) || !ObjectIdExp.test(userId)) {
            throw `userId in /data/reviews.js/judgeVoteDownInReviews has error`
        }
        const review=await this.getReviewById(reviewId)
        if(review==null){
            throw `didn't find review by id : ${reviewId} in /data/reviews.js/judgeVoteDownInReviews  `
        }
        const voteDownInReview=review.voteDown
        if(voteDownInReview.indexOf(userId)==-1){
            return false
        }else{
            return true
        }
    },
};

module.exports = exportedMethods;
