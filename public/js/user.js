//author: whd
(function ($) {
    //password elements
    const changePasswordDiv = $('#changePassword');
    const changePasswordFormSubmitButton = $('#changePasswordFormSubmitButton');
    const changePasswordFormStatus = $('#changePasswordFormStatus');
    const personalInfoChangePasswordButton = $('#personalInfoChangePasswordButton')
    const changePasswordFormOldPassword = $('#changePasswordFormOldPassword');
    const changePasswordFormNewPassword = $('#changePasswordFormNewPassword');
    const changePasswordFormNewPasswordCheck = $('#changePasswordFormNewPasswordCheck');
    const progressBar = $("#progressBar");
    const followedQuestionsStatus = $('#followedQuestionsStatus');
    const questionsStatus = $('#questionsStatus');
    const answersStatus = $('#answersStatus');
    const reviewsStatus = $('#reviewsStatus');
    const votedAnswersStatus = $('#votedAnswersStatus');
    const votedReviewsStatus = $('#votedReviewsStatus');
    //init
    

    //bind followedQuestions
    const followedQuestionsDivList = $('#userFollowedQuestionsList');
    const followedQuestionsLimitSelect = $('#followedQuestionsLimitSelect');
    const followedQuestionsSortSelect = $('#followedQuestionsSortSelect');
    followedQuestionsLimitSelect.change(init_followedQuestions);
    followedQuestionsSortSelect.change(init_followedQuestions);

    //bind questions
    const questionsDivList = $('#userQuestionsList');
    const questionsLimitSelect = $('#questionsLimitSelect');
    const questionsSortSelect = $('#questionsSortSelect');
    questionsLimitSelect.change(init_questions);
    questionsSortSelect.change(init_questions);

    //bind answers
    const answersDivList = $('#userAnswersList');
    const answersLimitSelect = $('#answersLimitSelect');
    const answersSortSelect = $('#answersSortSelect');
    answersLimitSelect.change(init_answers);
    answersSortSelect.change(init_answers);

    //bind reviews
    const reviewsDivList = $('#userReviewsList');
    const reviewsLimitSelect = $('#reviewsLimitSelect');
    const reviewsSortSelect = $('#reviewsSortSelect');
    reviewsLimitSelect.change(init_reviews);
    reviewsSortSelect.change(init_reviews);

    //bind votedAnswers
    const votedAnswersDivList = $('#userVotedAnswersList');
    const votedAnswersLimitSelect = $('#votedAnswersLimitSelect');
    const votedAnswersSortSelect = $('#votedAnswersSortSelect');
    votedAnswersLimitSelect.change(init_votedAnswers);
    votedAnswersSortSelect.change(init_votedAnswers);

    //bind votedReviews
    const votedReviewsDivList = $('#userVotedReviewsList');
    const votedReviewsLimitSelect = $('#votedReviewsLimitSelect');
    const votedReviewsSortSelect = $('#votedReviewsSortSelect');
    votedReviewsLimitSelect.change(init_votedReviews);
    votedReviewsSortSelect.change(init_votedReviews);



    init_page();
    init_followedQuestions();
    init_questions();
    init_answers();
    init_reviews();
    init_votedAnswers();
    init_votedReviews();

    //bind buttons

    personalInfoChangePasswordButton.click(function(event){
        event.preventDefault();
        changePasswordDiv.show();
        progressBar.hide();
        personalInfoChangePasswordButton.hide();
    })


    changePasswordFormSubmitButton.click(function(event){
        event.preventDefault();
        changePasswordFormStatus.empty();
        try {
            checkPassword(changePasswordFormOldPassword.val(), changePasswordFormNewPassword.val(), changePasswordFormNewPasswordCheck.val());
        } catch (error) {
            changePasswordFormStatus.empty();
            changePasswordFormStatus.html(`${error}`);
        }
        changePasswordFormStatus.show();
    })

    changePasswordFormOldPassword.focusout(function() {
        try {
            checkPasswordLegal("oldPassword", changePasswordFormOldPassword.val());
        } catch (error) {
            changePasswordFormStatus.empty();
            changePasswordFormStatus.html(`${error}`);
            changePasswordFormStatus.show();
            return;
        }
        changePasswordFormStatus.hide();
            
            
    });
    changePasswordFormNewPassword.focusout(function() {
        try {
            checkPasswordLegal("newPassword", changePasswordFormNewPassword.val());
        } catch (error) {
            changePasswordFormStatus.empty();
            changePasswordFormStatus.html(`${error}`);
            changePasswordFormStatus.show();
            return;
        }
        changePasswordFormStatus.hide();

    });
    changePasswordFormNewPasswordCheck.focusout(function() {
        try {
            checkPasswordLegal("the second new password", changePasswordFormNewPasswordCheck.val());
        } catch (error) {
            changePasswordFormStatus.empty();
            changePasswordFormStatus.html(`${error}`);
            changePasswordFormStatus.show();
            return;
        }
        changePasswordFormStatus.hide();

    });



 
    //functions
    function init_page(){
        changePasswordDiv.hide();
        changePasswordFormStatus.hide();
        followedQuestionsStatus.hide();
        questionsStatus.hide();
        answersStatus.hide();
        reviewsStatus.hide();
        votedAnswersStatus.hide();
        votedReviewsStatus.hide();
    }
    function checkPassword(oldPassword, newPassword, newPassword2){
        try {
            checkPasswordLegal("oldPassword", oldPassword);
            checkPasswordLegal("newPassword", newPassword);
            checkPasswordLegal("newPassword", newPassword2);
        } catch (error) {
            throw(error)
        }
        if(newPassword !== newPassword2){
            throw("Two input new password must be consistent");
        }
        if(newPassword === oldPassword){
            throw("The new password can not be same as the old password!");
        }

        progressBar.attr("class","progress-bar");
        progressBar.attr("style",`width:0%`);
        progressBar.show();
        let i = 0;
        let timer = setInterval(function(){
            progressBar.attr("style",`width:${i}0%`);
            progressBar.html(`${i}0%`);
            i += 1;
            if(i === 10)
                clearInterval(timer);
        },700)

        let targetUrl = "/user/changePassword";
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                changePasswordFormSubmitButton.hide();
                clearInterval(timer);
                progressBar.attr("class","progress-bar progress-bar-success");
                progressBar.attr("style",`width:100%`);
                progressBar.html(`100%`);
                changePasswordFormStatus.empty();
                changePasswordFormStatus.attr("class", "text-success")
                changePasswordFormStatus.html("You have successfully changed your password, we will send your new password to your email.");
            }
            else{
                clearInterval(timer);
                progressBar.hide();
                changePasswordFormStatus.empty();
                changePasswordFormStatus.html(`${responseMessage.message}`);
            } 
        });


    }

    function checkPasswordLegal(variabName, password){
        if (typeof password !== 'string') throw (`${variabName} must be a string`);
        let passwordPattern = /^[\w_-]{3,16}$/;
        if(!passwordPattern.test(password.trim())){
            throw (`${variabName} must be valid`);
        }

    }

    function init_followedQuestions(limit = "10", sort = "date"){

        limit = followedQuestionsLimitSelect.find(":selected").text();
        sort = followedQuestionsSortSelect.find(":selected").text();
        followedQuestionsDivList.empty();
        let targetUrl = `/user/getFollowedQuestions`;
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            limit: limit,
            sort: sort
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            const userFollowedQuestionsList = responseMessage.userFollowedQuestionsList;

            if(userFollowedQuestionsList.length === 0){
                followedQuestionsStatus.text("You haven't followed any question.");
                $('#followedQuestionsSelector').hide();
                followedQuestionsStatus.show();
                return;
            }

            let followedQuestionTable = $(`
                <table class="table table-bordered table-hover">
                    <caption>Questions you followed</caption>         
                <tr>
                    <th>Question</th>
                    <th>Number of answers</th>
                    <th>Created at</th>
                    <th>Unfollow the Question?</th>
                </tr>
                </table>
            `)
            //add the followedQuestions list
            for(let i =0; i < userFollowedQuestionsList.length; i++)
            {
                let newTableRow = $(`<tr></tr>`);
                let followedQuestion = userFollowedQuestionsList[i];
                let followedQuestionA = $(`<a class="followedQuestionsListQuestion" id="followedQuestion_${followedQuestion.questionId}" href="${followedQuestion.questionUrl}">${followedQuestion.questionName}</a>`);
                let followedQuestionUpdate = $(`<button class="btn btn-danger text-center" id="followedQuestion_update_${followedQuestion.questionId}"></button>`);
                followedQuestionUpdate.text("Unfollow");
                followedQuestionUpdate.click(updateFollowedQuestion);
                let followedQuestionATD = $(`<td></td>`);
                followedQuestionATD.append(followedQuestionA);
                let followedQuestionUpdateTD = $(`<td></td>`);
                followedQuestionUpdateTD.append(followedQuestionUpdate);
                newTableRow.append(followedQuestionATD);
                newTableRow.append($(`<td><P>${followedQuestion.numberOfAnswers}</P></td>`));
                newTableRow.append($(`<td><P>${followedQuestion.createdAt}</P></td>`));
                newTableRow.append(followedQuestionUpdateTD);
                followedQuestionTable.append(newTableRow);
            }
            followedQuestionsDivList.append(followedQuestionTable);
            followedQuestionsDivList.show();
        });
    }

    function updateFollowedQuestion(event){
        event.preventDefault();
        let target = $(event.target)
        let id = event.target.id.split("_")[2];
        let goal = target.text();
        let targetUrl = "/user/followQuestion";
        if(goal === "Unfollow")
        {
            targetUrl = "/user/unfollowQuestion";
        }
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            questionId: id
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                if(goal === "Unfollow"){
                    target.text("Follow");
                    target.attr("class", "btn btn-success text-center")
                }else{
                    target.text("Unfollow");
                    target.attr("class", "btn btn-danger text-center")
                }
                
            }
            else{
                console.log("fail");
            } 
        });
    }

    function init_questions(limit = "10", sort = "date"){

        limit = questionsLimitSelect.find(":selected").text();
        sort = questionsSortSelect.find(":selected").text();
        questionsDivList.empty();
        let targetUrl = `/user/getQuestions`;
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            limit: limit,
            sort: sort
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            const userQuestionsList = responseMessage.userQuestionsList;

            if(userQuestionsList.length === 0){
                questionsStatus.text("You haven't asked any question.");
                $('#questionsSelector').hide();
                questionsStatus.show();
                return;
            }

            let questionTable = $(`
                <table class="table table-bordered table-hover">
                    <caption>Questions you asked</caption>         
                <tr>
                    <th>Question</th>
                    <th>Number of answers</th>
                    <th>Created at</th>
                    <th>Delete the Question?</th>
                </tr>
                </table>
            `)
            //add the questions list
            for(let i =0; i < userQuestionsList.length; i++)
            {
                let newTableRow = $(`<tr></tr>`);
                let question = userQuestionsList[i];
                let questionA = $(`<a class="questionsListQuestion" id="question_${question.questionId}" href="${question.questionUrl}">${question.questionName}</a>`);
                let questionDelete = $(`<button class="btn btn-danger text-center" id="question_delete_${question.questionId}"></button>`);
                questionDelete.text("delete");
                questionDelete.click(deleteQuestion);
                let questionATD = $(`<td></td>`);
                questionATD.append(questionA);
                let questionDeleteTD = $(`<td></td>`);
                questionDeleteTD.append(questionDelete);
                // let h2 = $(`<h2></h2>`);
                // let article = $(`<article></article>`);
                newTableRow.append(questionATD);
                newTableRow.append($(`<td><P>${question.numberOfAnswers}</P></td>`));
                newTableRow.append($(`<td><P>${question.createdAt}</P></td>`));
                newTableRow.append(questionDeleteTD);
                questionTable.append(newTableRow);
            }
            questionsDivList.append(questionTable);
            questionsDivList.show();
        });
    }

    function deleteQuestion(event){
        event.preventDefault();
        let id = event.target.id.split("_")[2];
        if(event.target.text === "deleted"){
            return;
        }
        let targetUrl = "/user/deleteQuestion";
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            questionId: id
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                let target = $(event.target);
                target.attr("class","btn btn-secondary text-center")
                target.text("deleted")
                target.attr("disabled", true);
                let questionA = $(`#question_${id}`);
                // let questionDelete = $(`#question_delete_${id}`);
                questionA.removeAttr("href");
                questionA.addClass("deactive");
                // questionDelete.removeAttr("href");
                // questionDelete.addClass("deactive");
                // questionDelete.text("deleted");
                init_followedQuestions();
                init_answers();
                init_reviews();
                init_votedAnswers();
                init_votedReviews();
            }
            else{
                console.log("fail");
            } 
        });
    }

    function init_answers(limit = "10", sort = "date"){

        limit = answersLimitSelect.find(":selected").text();
        sort = answersSortSelect.find(":selected").text();
        answersDivList.empty();
        let targetUrl = `/user/getAnswers`;
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            limit: limit,
            sort: sort
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            const userAnswersList = responseMessage.userAnswersList;

            if(userAnswersList.length === 0){
                answersStatus.text("You haven't answered any question.");
                $('#answersSelector').hide();
                answersStatus.show();
                return;
            }

            let answerTable = $(`
                <table class="table table-bordered table-hover">
                    <caption>Questions you answered</caption>         
                <tr>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Vote Up</th>
                    <th>Vote Down</th>
                    <th>Reviews</th>
                    <th>Updated at</th>
                    <th>Delete the Answer?</th>
                </tr>
                </table>
            `)
            //add the answers list
            for(let i =0; i < userAnswersList.length; i++)
            {
                let answer = userAnswersList[i];
                let answerQuestionA = $(`<a class="answersListQuestion" href="${answer.questionUrl}">${answer.questionName}</a>`);
                
                let answerDelete = $(`<button class="btn btn-danger text-center" id="answer_delete_${answer.answerId}"></button>`);
                answerDelete.text("delete");
                answerDelete.click(deleteAnswer);
                let answerQuestionATD = $(`<td></td>`);
                answerQuestionATD.append(answerQuestionA);
                let answerDeleteTD = $(`<td></td>`);
                answerDeleteTD.append(answerDelete);

                //generate reviews
                let answerReviewsTD = $('<td></td>');
                let AnswerReviewsUL = $('<ul></ul>');
                for(let j = 0; j < answer["reviews"].length; j++ ){
                    let reviewLI = $(`<li>${answer["reviews"][j]}</li>`);
                    AnswerReviewsUL.append(reviewLI);
                }
                answerReviewsTD.append(AnswerReviewsUL);

                //add table data to new row
                let newTableRow = $(`<tr></tr>`);
                newTableRow.append(answerQuestionATD);
                newTableRow.append($(`<td><P>${answer["answerContent"]}</P></td>`));
                newTableRow.append($(`<td><P>${answer["numberOfVoteUp"]}</P></td>`));
                newTableRow.append($(`<td><P>${answer["numberOfVoteDown"]}</P></td>`));
                newTableRow.append(answerReviewsTD);
                newTableRow.append($(`<td><P>${answer["recentUpdatedTime"]}</P></td>`));
                newTableRow.append(answerDeleteTD);
                answerTable.append(newTableRow);
            }
            answersDivList.append(answerTable);
            answersDivList.show();
        });
    }

    function deleteAnswer(event){
        event.preventDefault();
        if(event.target.text === "deleted"){
            return;
        }
        let id = event.target.id.split("_")[2];
        let targetUrl = "/user/deleteAnswer";
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            answerId: id
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                let target = $(event.target);
                target.attr("class","btn btn-secondary text-center")
                target.text("deleted")
                target.attr("disabled", true);
                // let answerDelete = $(`#answer_delete_${id}`);
                // answerDelete.removeAttr("href");
                // answerDelete.addClass("deactive");
                // answerDelete.text("deleted");
                init_reviews();
                init_votedAnswers();
                init_votedReviews();
            }
            else{
                console.log("fail");
            } 
        });
    }

    //reviews
    function init_reviews(limit = "10", sort = "date"){

        limit = reviewsLimitSelect.find(":selected").text();
        sort = reviewsSortSelect.find(":selected").text();
        reviewsDivList.empty();
        let targetUrl = `/user/getReviews`;
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            limit: limit,
            sort: sort
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            const userReviewsList = responseMessage.userReviewsList;

            if(userReviewsList.length === 0){
                reviewsStatus.text("You haven't reviewed any answer.");
                $('#reviewsSelector').hide();
                reviewsStatus.show();
                return;
            }

            let reviewTable = $(`
                <table class="table table-bordered table-hover">
                    <caption>Answers you reviewed</caption>         
                <tr>
                    <th>Question</th>
                    <th>Answer</th>
                    <th>Your Review</th>
                    <th>Vote Up</th>
                    <th>Vote Down</th>
                    <th>Updated at</th>
                    <th>Delete the Review?</th>
                </tr>
                </table>
            `)
            //add the reviews list
            for(let i =0; i < userReviewsList.length; i++)
            {
                let review = userReviewsList[i];
                let reviewQuestionA = $(`<a class="reviewsListQuestion" href="${review.questionUrl}">${review.questionName}</a>`);
                
                let reviewDelete = $(`<button class="btn btn-danger text-center" id="review_delete_${review.reviewId}"></button>`);
                reviewDelete.text("delete");
                reviewDelete.click(deleteReview);
                let reviewQuestionATD = $(`<td></td>`);
                reviewQuestionATD.append(reviewQuestionA);
                let reviewDeleteTD = $(`<td></td>`);
                reviewDeleteTD.append(reviewDelete);

                //add table data to new row
                let newTableRow = $(`<tr></tr>`);
                newTableRow.append(reviewQuestionATD);
                newTableRow.append($(`<td><P>${review["answerContent"]}</P></td>`));
                newTableRow.append($(`<td><P>${review["reviewContent"]}</P></td>`));
                newTableRow.append($(`<td><P>${review["numberOfVoteUp"]}</P></td>`));
                newTableRow.append($(`<td><P>${review["numberOfVoteDown"]}</P></td>`));
                newTableRow.append($(`<td><P>${review["recentUpdatedTime"]}</P></td>`));
                newTableRow.append(reviewDeleteTD);
                reviewTable.append(newTableRow);
            }
            reviewsDivList.append(reviewTable);
            reviewsDivList.show();
        });
    }

    function deleteReview(event){
        event.preventDefault();
        let id = event.target.id.split("_")[2];
        let targetUrl = "/user/deleteReview";
        let requestConfig = {
            method: 'POST',
            url: targetUrl,
            contentType: 'application/json',
            data: JSON.stringify({
            reviewId: id
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                let target = $(event.target);
                target.attr("class","btn btn-secondary text-center")
                target.text("deleted")
                target.attr("disabled", true);
                // let reviewDelete = $(`#review_delete_${id}`);
                // reviewDelete.removeAttr("href");
                // reviewDelete.addClass("deactive");
                // reviewDelete.text("deleted");
                init_votedReviews();
            }
            else{
                console.log("fail");
            } 
        });
    }
    
//votedAnswers
function init_votedAnswers(limit = "10", sort = "date"){

    limit = votedAnswersLimitSelect.find(":selected").text();
    sort = votedAnswersSortSelect.find(":selected").text();
    votedAnswersDivList.empty();
    let targetUrl = `/user/getVotedAnswers`;
    let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
        limit: limit,
        sort: sort
    })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        const userVotedAnswersList = responseMessage.userVotedAnswersList;

        if(userVotedAnswersList.length === 0){
            votedAnswersStatus.text("You haven't voted any answer.");
            $('#votedAnswersSelector').hide();
            votedAnswersStatus.show();
            return;
        }

        let votedAnswerTable = $(`
            <table class="table table-bordered table-hover">
                <caption>Answers you voted</caption>         
            <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Vote Up</th>
                <th>Vote Down</th>
                <th>Answer Updated At</th>
                <th>Your Vote</th>
            </tr>
            </table>
        `)

        //add the votedAnswers list
        for(let i =0; i < userVotedAnswersList.length; i++)
        {
            let votedAnswer = userVotedAnswersList[i];
            let votedAnswerQuestionA = $(`<a class="votedAnswersListQuestion" href="${votedAnswer.questionUrl}">${votedAnswer.questionName}</a>`);
            
            let votedAnswerVoteUp = $(`<a href="" id="votedAnswer_voteUp_votedAnswerId_${votedAnswer.votedAnswerId}_VotedAnswerUserId_${votedAnswer.VotedAnswerUserId}"></a>`);
            votedAnswerVoteUp.text(" Vote Up ");

            let votedAnswerVoteDown = $(`<a href="" id="votedAnswer_voteDown_votedAnswerId_${votedAnswer.votedAnswerId}_VotedAnswerUserId_${votedAnswer.VotedAnswerUserId}"></a>`);
            votedAnswerVoteDown.text(" Vote Down ");

            if(votedAnswer["IsVoteUp"]){
                votedAnswerVoteUp.text(" Voted Up ");
                votedAnswerVoteUp.removeAttr("href");
                votedAnswerVoteUp.addClass("deactive");
            }
            else{
                votedAnswerVoteDown.text(" Voted Down ");
                votedAnswerVoteDown.removeAttr("href");
                votedAnswerVoteDown.addClass("deactive");
            }

            votedAnswerVoteUp.click(updateVotedAnswer);
            votedAnswerVoteDown.click(updateVotedAnswer);

            let votedAnswerQuestionATD = $(`<td></td>`);
            votedAnswerQuestionATD.append(votedAnswerQuestionA);
            let votedAnswerUpdateTD = $(`<td></td>`);
            votedAnswerUpdateTD.append(votedAnswerVoteUp);
            votedAnswerUpdateTD.append($('<br>'));
            votedAnswerUpdateTD.append(votedAnswerVoteDown);

            //add table data to new row
            let newTableRow = $(`<tr></tr>`);
            newTableRow.append(votedAnswerQuestionATD);
            newTableRow.append($(`<td><P>${votedAnswer["answerContent"]}</P></td>`));
            //newTableRow.append($(`<td><P>${review["reviewContent"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedAnswer["numberOfVoteUp"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedAnswer["numberOfVoteDown"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedAnswer["recentUpdatedTime"]}</P></td>`));
            newTableRow.append(votedAnswerUpdateTD);
            if(votedAnswer["IsVoteUp"]){
                newTableRow.attr("class","success");
            }
            else{
                newTableRow.attr("class","danger");
            }
            votedAnswerTable.append(newTableRow);
        }
        votedAnswersDivList.append(votedAnswerTable);
        votedAnswersDivList.show();
    });
}

function updateVotedAnswer(event){
    event.preventDefault();
    //votedAnswer_voteDown_votedAnswerId_${votedAnswer.votedAnswerId}_VotedAnswerUserId_${votedAnswer.VotedAnswerUserId}
    let desVoteId = event.target.id;
    if($(`#${desVoteId}`).text().trim().split(" ")[0] === "Voted"){
        return;
    }
    let answerId = desVoteId.split("_")[3];
    let userId = desVoteId.split("_")[5];
    let desVoteStatus = desVoteId.split("_")[1];
    let originVoteStatusId;
    if(desVoteStatus === "voteUp")
    {
        originVoteStatusId = `votedAnswer_voteDown_votedAnswerId_${answerId}_VotedAnswerUserId_${userId}`;
    }else{
        originVoteStatusId = `votedAnswer_voteUp_votedAnswerId_${answerId}_VotedAnswerUserId_${userId}`;
    }
    let targetUrl = "/user/updateVoteAnswer";
    let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
            answerId: answerId,
            userId: userId,
            goal: desVoteStatus
    })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        if(responseMessage.status === true){
            // let desVoteA = $(`#${desVoteId}`);
            // let originVoteA = $(`#${originVoteStatusId}`);
            // if(desVoteStatus === "voteUp"){
            //     desVoteA.removeAttr("href");
            //     desVoteA.addClass("deactive")
            //     desVoteA.text(" Voted Up ");
            //     originVoteA.attr("href", "");
            //     originVoteA.removeClass("deactive");
            //     originVoteA.text(" Vote Down");
            //     desVoteA.parent().parent().attr("class","success");
            // }else{
            //     desVoteA.removeAttr("href");
            //     desVoteA.addClass("deactive")
            //     desVoteA.text(" Voted Down ");
            //     originVoteA.attr("href", "");
            //     originVoteA.removeClass("deactive");
            //     originVoteA.text(" Vote Up");
            //     desVoteA.parent().parent().attr("class","danger");
            // }
            init_votedAnswers();

        }
        else{
            console.log("fail");
        } 
    });
}

// voted reviews
function init_votedReviews(limit = "10", sort = "date"){

    limit = votedReviewsLimitSelect.find(":selected").text();
    sort = votedReviewsSortSelect.find(":selected").text();
    votedReviewsDivList.empty();
    let targetUrl = `/user/getVotedReviews`;
    let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
        limit: limit,
        sort: sort
    })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        const userVotedReviewsList = responseMessage.userVotedReviewsList;
        
        if(userVotedReviewsList.length === 0){
            votedReviewsStatus.text("You haven't voted any review.");
            $('#votedReviewsSelector').hide();
            votedReviewsStatus.show();
            return;
        }

        let votedReviewTable = $(`
            <table class="table table-bordered table-hover">
                <caption>Reviews you voted</caption>         
            <tr>
                <th>Question</th>
                <th>Answer</th>
                <th>Review</th>
                <th>Vote Up</th>
                <th>Vote Down</th>
                <th>Review Updated At</th>
                <th>Your Vote</th>
            </tr>
            </table>
        `)

        //add the votedReviews list
        for(let i =0; i < userVotedReviewsList.length; i++)
        {
            let votedReview = userVotedReviewsList[i];
            let votedReviewQuestionA = $(`<a class="votedReviewsListQuestion" href="${votedReview.questionUrl}">${votedReview.questionName}</a>`);
            
            let votedReviewVoteUp = $(`<a href="" id="votedReview_voteUp_votedReviewId_${votedReview.votedReviewId}_VotedReviewUserId_${votedReview.VotedReviewUserId}"></a>`);
            votedReviewVoteUp.text(" Vote Up ");

            let votedReviewVoteDown = $(`<a href="" id="votedReview_voteDown_votedReviewId_${votedReview.votedReviewId}_VotedReviewUserId_${votedReview.VotedReviewUserId}"></a>`);
            votedReviewVoteDown.text(" Vote Down ");
            votedReviewVoteUp.addClass("vote");
            votedReviewVoteDown.addClass("vote");
            if(votedReview["IsVoteUp"]){
                votedReviewVoteUp.text(" Voted Up ");
                votedReviewVoteUp.removeAttr("href");
                votedReviewVoteUp.addClass("deactive");
            }
            else{
                votedReviewVoteDown.text(" Voted Down ");
                votedReviewVoteDown.removeAttr("href");
                votedReviewVoteDown.addClass("deactive");
            }

            votedReviewVoteUp.click(updateVotedReview);
            votedReviewVoteDown.click(updateVotedReview);

            let votedReviewQuestionATD = $(`<td></td>`);
            votedReviewQuestionATD.append(votedReviewQuestionA);
            let votedReviewUpdateTD = $(`<td></td>`);
            votedReviewUpdateTD.append(votedReviewVoteUp);
            votedReviewUpdateTD.append($('<br>'));
            votedReviewUpdateTD.append(votedReviewVoteDown);

            //add table data to new row
            let newTableRow = $(`<tr></tr>`);
            newTableRow.append(votedReviewQuestionATD);
            newTableRow.append($(`<td><P>${votedReview["answerContent"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedReview["reviewContent"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedReview["numberOfVoteUp"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedReview["numberOfVoteDown"]}</P></td>`));
            newTableRow.append($(`<td><P>${votedReview["recentUpdatedTime"]}</P></td>`));
            newTableRow.append(votedReviewUpdateTD);
            if(votedReview["IsVoteUp"]){
                newTableRow.attr("class","success");
            }
            else{
                newTableRow.attr("class","danger");
            }
            votedReviewTable.append(newTableRow);
        }
        votedReviewsDivList.append(votedReviewTable);
        votedReviewsDivList.show();
    });
}

function updateVotedReview(event){
    event.preventDefault();
    //votedReview_voteDown_votedReviewId_${votedReview.votedReviewId}_VotedReviewUserId_${votedReview.VotedReviewUserId}
    let desVoteId = event.target.id;
    if($(`#${desVoteId}`).text().trim().split(" ")[0] === "Voted"){
        return;
    }
    let reviewId = desVoteId.split("_")[3];
    let userId = desVoteId.split("_")[5];
    let desVoteStatus = desVoteId.split("_")[1];
    let originVoteStatusId;
    if(desVoteStatus === "voteUp")
    {
        originVoteStatusId = `votedReview_voteDown_votedReviewId_${reviewId}_VotedReviewUserId_${userId}`;
    }else{
        originVoteStatusId = `votedReview_voteUp_votedReviewId_${reviewId}_VotedReviewUserId_${userId}`;
    }
    let targetUrl = "/user/updateVoteReview";
    let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
            reviewId: reviewId,
            userId: userId,
            goal: desVoteStatus
    })
    };
    $.ajax(requestConfig).then(function (responseMessage) {
        if(responseMessage.status === true){
            init_votedReviews();
            // let desVoteA = $(`#${desVoteId}`);
            // let originVoteA = $(`#${originVoteStatusId}`);
            // if(desVoteStatus === "voteUp"){
            //     desVoteA.removeAttr("href");
            //     desVoteA.addClass("deactive");
            //     desVoteA.text(" Voted Up ");
            //     originVoteA.attr("href", "");
            //     originVoteA.removeClass("deactive");
            //     originVoteA.text(" Vote Down");
            //     desVoteA.parent().parent().attr("class","success");
            // }else{
            //     desVoteA.removeAttr("href");
            //     desVoteA.addClass("deactive");
            //     desVoteA.text(" Voted Down ");
            //     originVoteA.attr("href", "");
            //     originVoteA.removeClass("deactive");
            //     originVoteA.text(" Vote Up");
            //     desVoteA.parent().parent().attr("class","danger");
            // }

        }
        else{
            console.log("fail");
        } 
    });
}
})(window.jQuery);