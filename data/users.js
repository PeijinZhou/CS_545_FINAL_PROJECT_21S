    const mongoCollections = require('../config/mongoCollections');
    const users = mongoCollections.users;
    const questions = mongoCollections.questions;
    const answers = mongoCollections.answers;
    const reviews = mongoCollections.reviews;
    const { ObjectId } = require('mongodb');
    const bcryptjs = require("bcryptjs")

    let exportedMethods = {
        async getAllUsers() {
            const userCollection = await users();
            const userList = await userCollection.find({}).toArray();
            if (!userList) throw new Error('404: Users not found');
            return userList;
        },
        /**
         * get user by id
         * @param {*} id 
         */
        async getUserByEmail(email) {
            if (!email) throw new Error('You must provide an email');
            if (typeof email !== 'string') 
                throw new TypeError('email must be a string');
            email = email.trim().toLowerCase();
            const userCollection = await users();
            try{
                const userByEmail = await userCollection.findOne({ email: email });
                return userByEmail;
            }catch(error){
                throw `there is an error in /data/users.js/getUserByEmail `
            }
        },
        

        async getUserById(id) {
            // const objId = ObjectId.createFromHexString(id);;
            if (!id) throw new Error('You must provide an id');
            if(typeof id === 'string')
                id = ObjectId(id);
            // if (typeof id !== 'string') throw new TypeError('id must be a string');
            
            const usersCollection = await users();
            try {
                const user = await usersCollection.findOne({ _id: id });
                return user;
            } catch (error) {
                throw `there is an error in /data/users.js/getUser`
            }
        },
        async getUserByName(name) {
            if (!name) throw new Error('You must provide an name');
            if (typeof name !== 'string') throw new TypeError('name must be a string');

            name = name.trim().toLowerCase();

            const userCollection = await users();
            try{
            const getUserByName = await userCollection.findOne({ "userName": name });
            return getUserByName;
            }catch(error){
                throw `there is an error in /data/users.js/getUserByEmail `
            }


            
        },

        async addUser(email, password, userName) {
           
            if (!email) throw new Error('You must provide an email');
            if (!password) throw new Error('You must provide a password');
            if (!userName) throw new Error('You must provide a userNme');
            if (userName.length>3&&userName.length<16){
                
            }else{
                throw new Error('You userName  should be 3 - 16 length');
            }
            if (password.length>3&&password.length<16){
               
            }else{
                throw new Error('You password  should be 3 - 16 length');
            }
            let reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
            if(!reg.test(email)){
                throw new Error('You email type error');
            }
            if (typeof email !== 'string') throw new TypeError('email must be a string');
            if (typeof password !== 'string') throw new TypeError('hashedPassword must be a string');
            if (typeof userName !== 'string') throw new TypeError('userName must be a string');
            email = email.trim().toLowerCase();
            userName = userName.trim().toLowerCase();
            password = password.trim();
            let emailExists = false;
            try {
                const user = await this.getUserByEmail(email);
                if(user != null)
                    emailExists = true;
            } catch (err) {
                emailExists = false;
            }

            let userExists = false;
            try {
                const user = await this.getUserByName(userName);
                if(user != null)
                userExists = true;
            } catch (err) {
                userExists = false;
            }

            if (emailExists) throw new Error('Email already registered');
            if (userExists) throw new Error('User Name already registered');

            const salt = bcryptjs.genSaltSync(16);
            const hash = bcryptjs.hashSync(password, salt);
            let newUser = {
                email: email,
                hashedPassword: hash,
                userName: userName,
                questions: [],
                dateSignedIn:new Date,
                reviews: [],
                answers: [],
                votedForReviews:[],
                votedForAnswers:[],
                followedQuestions: []
            };
            const userCollection = await users();
            let newInsertInformation
            try {
                newInsertInformation = await userCollection.insertOne(newUser);
            } catch (error) {
                throw new Error('Can not insert user.');
            }
            
            return await this.getUserById((newInsertInformation.insertedId) );
        },
        // async removeUser(id) {
        //     if (!id) throw new Error('You must provide an id');
        //     if (typeof id !== 'string') throw new TypeError('id must be a string');

        //     const userCollection = await users();
        //     const deletionInfo = await userCollection.removeOne({ _id: ObjectId(id) });
        
        //     if (deletionInfo.deletedCount === 0) {
        //         throw new Error(`Could not delete user with id of ${id}`);
        //     }

        //     return true;
        // },
        async addQuestion(userId,questionId){
            if (!userId) throw new Error('You must provide a userId');
            if (!questionId) throw new Error('You must provide a questionId')

            const questionCollection = await questions();
            const find = await questionCollection.findOne({ _id: ObjectId(questionId) });
            if (find == null) throw  new Error ("We don't have this question.");

            const userCollection = await users();
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $addToSet: { questions: questionId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error ('Update failed');
            return await this.getUserById(userId);
        },
        async removeQuestion(userId,questionId){
            if (!userId) throw new Error('You must provide a userId');
            if (!questionId) throw new Error('You must provide a questionId')
            const userCollection = await users();
            // let user = await this.getUserById(userId);
            // // console.log(user);
            // for(let questionId of user.questions){
            //     // console.log(questionId);
            // }
            const questionCollection = await questions();
            const find = await questionCollection.findOne({ _id: ObjectId(questionId) });
            if (find == null) throw  new Error ("We don't have this question.");            
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $pull: { questions: questionId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error ('Update failed');
        
            return await this.getUserById(userId);
        },
        
        async removeReview(userId,reviewId){
            if (!userId) throw new Error('You must provide a userId');
            if (!reviewId) throw new Error('You must provide a reviewId')
            const reviewCollection = await reviews();
            const find = await reviewCollection.findOne({ _id: ObjectId(reviewId) });
            if (find == null) throw  new Error ("We don't have this review.");           
            const userCollection = await users();
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $pull: { reviews: reviewId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
        
            return await this.getUserById(userId);
        },

        async addReview(userId,reviewId){
            if (!userId) throw new Error('You must provide a userId');
            if (!reviewId) throw new Error('You must provide a reviewId');
            const reviewCollection = await reviews();
            const find = await reviewCollection.findOne({ _id: ObjectId(reviewId) });
            if (find == null) throw  new Error ("We don't have this review.");        
            const userCollection = await users();
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $addToSet: { reviews: reviewId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
            return await this.getUserById(userId);
        },
        //update user answer
        async addAnswer(userId,answerId){//string
		    //the answerId is the answer that the user answered
            if (!userId) throw new Error('You must provide a userId');
            if (!answerId) throw new Error('You must provide a answerId')
            const answerCollection = await answers();
            const find = await answerCollection.findOne({ _id: ObjectId(answerId) });
            if (find == null) throw  new Error ("We don't have this answer.");        
            const userCollection = await users();
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $addToSet: { answers: answerId } }
        );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
            return await this.getUserById(userId);
        },
        async removeAnswer(userId,answerId){
            if (!userId) throw new Error('You must provide a userId');
            if (!answerId) throw new Error('You must provide a answerId');
            const answerCollection = await answers();
            const find = await answerCollection.findOne({ _id: ObjectId(answerId) });
            if (find == null) throw  new Error ("We don't have this answer.");
            const userCollection = await users();
            const updateInfo = await userCollection.updateOne(
                { _id: ObjectId(userId) },
                { $pull: { answers: answerId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';
        
            return await this.getUserById(userId);

        },
        async checkPassword(email,password){
            if(!email || typeof email !== "string")
            throw "you should input a vaild email";
            if (!password || typeof password !== "string")
            throw 'you should input a string as the password';
            email = email.trim().toLowerCase();
            password = password.trim();
            let newUser = await this.getUserByEmail(email);
            if(!newUser){
                throw `We don't have user whose email is ${email}`;
            }
            let passwordMatch = await bcryptjs.compare(password, newUser.hashedPassword);
            if(!passwordMatch){
                throw "The password does not match the email.";
            }
            return await this.getUserByEmail(email);
        },
        async setPassword(id,newPassword){
            if(!id) throw "need a vaild user id.";
            if(typeof id != 'string' || id.length === 0) throw "need a vaild user id.";
            if(!newPassword) throw "need a vaild new password.";
            if(typeof newPassword != 'string' || newPassword.trim().length === 0) throw "need a vaild new password.";
            
            id = ObjectId(id);
            newPassword = newPassword.trim();
            const userCollection = await users();
            const salt = bcryptjs.genSaltSync(16);
            const hash = bcryptjs.hashSync(newPassword, salt);
            let userUpdateInfo = {
                hashedPassword: hash
            };
            let newUser = await this.getUserById(id);
            if(!newUser){
                throw `We don't have this user`;
            };
            let updatedInfo = await userCollection.updateOne(
                { _id: id },
                { $set: userUpdateInfo });
            if (updatedInfo.modifiedCount === 0) {
                 throw 'could not edit the password successfully';
        }   
            return this.getUserById(id);
        },
        async changPassword(id,password,newPassword){
        
        if(!id) throw "need a vaild user id.";
        if(typeof id != 'string' || id.length === 0) throw "need a vaild user id.";
        if(!password) throw "need a vaild password.";
        if(typeof password != 'string' || password.trim().length === 0) throw "need a vaild password.";
        if(!newPassword) throw "need a vaild new password.";
        if(typeof newPassword != 'string' || newPassword.trim().length === 0) throw "need a vaild new password.";
        
        id = ObjectId(id);
        password = password.trim();
        newPassword = newPassword.trim();

        const userCollection = await users();
        let newUser = await this.getUserById(id);
        let passwordMatch = await bcryptjs.compare(password, newUser.hashedPassword);
        if(!passwordMatch){
            throw "Please provide right old password.";
        }
        const salt = bcryptjs.genSaltSync(16);
        const hash = bcryptjs.hashSync(newPassword, salt);
        let userUpdateInfo = {
            hashedPassword: hash
        };
        let updatedInfo = await userCollection.updateOne({ _id: id }, { $set: userUpdateInfo });
        if (updatedInfo.modifiedCount === 0) {
                throw 'could not edit the password successfully';
    }   
        return this.getUserById(id);
    
    },

    //follow a question
    async followQuestion(userId, questionId){
        if (!userId || typeof userId != 'string') throw new Error('You must provide a valid userId');
        if (!questionId || typeof userId != 'string') throw new Error('You must provide a valid questionId')
        if(await this.followQuestionCheck(userId, questionId)) throw new Error('This question already had been followed.')
        const userCollection = await users();
        let user = await this.getUserById(userId);
        const questionCollection = await questions();
        // const ObjectId = await myDBfunction(id);
        const find = await questionCollection.findOne({ _id: ObjectId(questionId) });
        if (find == null) throw  new Error ("We don't have this question.");

        let updateQuestion = await questionCollection.updateOne(
            { _id: find["_id"] },
            { $addToSet: { followers: userId } }
        );
        if (!updateQuestion.matchedCount && !updateInfo.modifiedCount) throw new Error ('updateQuestion failed');

        let updateInfo;
        if(user)
        {
            updateInfo = await userCollection.updateOne(
                { _id: user["_id"] },
                { $addToSet: { followedQuestions: questionId } }
            );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error ('Update failed');
        }else{
            throw new Error ("We don't have this question.");
        }
        user = await this.getUserById(userId);
        return user;
    },
    async unfollowQuestion(userId, questionId){
        if (!userId || typeof userId != 'string') throw new Error('You must provide a valid userId');
        if (!questionId || typeof userId != 'string') throw new Error('You must provide a valid questionId')
        if(!await this.followQuestionCheck(userId, questionId)) throw new Error("This question haven't been followed.")
        const userCollection = await users();
        let user = await this.getUserById(userId);
        const questionCollection = await questions();
        const find = await questionCollection.findOne({ _id: ObjectId(questionId) });
        if (find == null) throw  new Error ("We don't have this question.");
        let updateQuestion = await questionCollection.updateOne(
            { _id: find["_id"] },
            { $pull: { followers: userId } }
        );
        if (!updateQuestion.matchedCount && !updateInfo.modifiedCount) throw new Error ('updateQuestion failed');

        let updateInfo;
        if(user)
        {
            updateInfo = await userCollection.updateOne(
                { _id: user["_id"] },
                { $pull: { followedQuestions: questionId } }
            );
            if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw new Error ('Update failed');
        }
        else{
            throw new Error ("We don't have this question.");
        }
        
        user = await this.getUserById(userId);
        return user;
    },

    async followQuestionCheck(userId, questionId){
        if (!userId || typeof userId != 'string') throw new Error('You must provide a valid userId');
        if (!questionId || typeof userId != 'string') throw new Error('You must provide a valid questionId')
        const userCollection = await users();
        let user = await this.getUserById(userId);
        let check = false;
        if(user["followedQuestions"].indexOf(questionId) != -1){
            check = true;
        };
        return check;
        
    }

        
    
}

    // removeUser(userId){
    //     1. remove user
    //     2. requireQuestion : remove(questionId)
    //     // user.deleteOne()
    //     const questionUtil = require("./questions");
    //     let user = this.getUserById(userId);
    //     questionList = user.questionList;
    //     for(let questionId in questionList){
    //         questionUtil.removeAnswer(questionId);
    //     }

    // }
    

   module.exports = exportedMethods;
    // //quetion removeAnswer
    // removeAnswer(questionId, answerId) 拿到question 删掉它里面的answerId就行
    // //answer removeAnswer
    // 首先删掉answer表里answer
    // 拿到questionId 调用question的removeAnswer()
    // 调用review的removeReviewById
    
