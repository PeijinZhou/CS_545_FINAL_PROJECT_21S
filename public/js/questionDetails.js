(function ($) {
    const answerSubmit = $('#answerSubmit')
    const answerContent = $('#answerContent')
    const quesId = $('#quesId')
    const mainTable = $('#mainTable')
    const addAnswerSuccessful = $('#addAnswerSuccessful')
    const addAnswerFailed = $('#addAnswerFailed')
    const hidTest = $('#hidTest')
    const questionInfo = $('#questionInfo')
    $('[id^="ReviewNumber"]').hide();
    addAnswerSuccessful.hide()
    addAnswerFailed.hide()

 

    $(document).on('click', '#linkToTwitter', function (event) {
        event.preventDefault();
        let question=$('#questionContent').text()
        console.log(question);
        question = question.replace(/\s+$/,''); 
        question = question.replace(/^\s+/,'')
        question="I find a very interesting question : "+question
        let url="https://twitter.com/intent/tweet?via=%22QandA%22&text="+question
        window.open(url);
    })

    
    $(document).on('click', '#followQuestion', function (event) {
        event.preventDefault();
        var questionId = quesId.text()
        var url="/question/"
        var option=$('#followQuestion').text()
        //go to follow it
        if(option.indexOf('unfollow')==-1){
            url=url+"followQ"
        }else{
            // go unfollow it
            url=url+"unfollowQ"
        }
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                const option = responseMessage.option
                if(option=='follow'){
                    $('#followQuestion').text('follow question')
                }else{
                    $('#followQuestion').text('unfollow question')
                }

            }
            else {
                alert("something wrong")
            }
        });

    })

    $(document).on('click', '.ReviewNumberShowButton', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        a = "ReviewNumberIdShow" + a.replace("ReviewNumberId", "")
        $("#" + a).toggle()
    })

    $(document).on('click', '#sortByRecent', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        var questionId = quesId.text()
        var url = "/question/sortByRecent"
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                mainTable.empty()
                const answerId = responseMessage.newReviewInAnswer
                const newAnswerList = responseMessage.sortedAnswerList
                AnalysAnswerListToHTML(newAnswerList)
                $('[id^="ReviewNumber"]').hide();
                $("#ReviewNumberIdShow" + answerId).show()
            }
            else {
                alert("something wrong")
            }
        });
    })

    $(document).on('click', '#sortByPopular', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        var questionId = quesId.text()
        var url = "/question/sortByPopular"
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                mainTable.empty()
                const answerId = responseMessage.newReviewInAnswer
                const newAnswerList = responseMessage.sortedAnswerList
                AnalysAnswerListToHTML(newAnswerList)
                $('[id^="ReviewNumber"]').hide();
                $("#ReviewNumberIdShow" + answerId).show()
            }
            else {
                alert("something wrong")
            }
        });
    })

    $(document).on('click', '.answerButtonUnVoted', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        var answerid;
        let url;
        const questionId = quesId.text()
        // it's votedown
        if (a.indexOf("voteUp") == -1) {
            answerid = a.replace("voteDn", "")
            url = "/question/voteDownAnswer/" + questionId + "/" + answerid
        } else {
            //it 's vote up
            answerid = a.replace("voteUp", "")
            url = "/question/voteUpAnswer/" + questionId + "/" + answerid
        }
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
                answerid: answerid
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                mainTable.empty()
                const newAnswerList = responseMessage.newAnswerList
                AnalysAnswerListToHTML(newAnswerList)
                $('[id^="ReviewNumber"]').hide();
                $("#ReviewNumberIdShow" + answerid).show()
            }
            else {
                alert("something wrong")
            }
        });

    })

    $(document).on('click', '.reviewButtonUnVoted', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        var url;
        var questionId = quesId.text()
        var reviewId;
        // it's votedown
        if (a.indexOf("voteUp") == -1) {
            reviewId = a.replace("voteDn", "")
            url = "/question/voteDownReview/" + questionId + "/" + reviewId
        } else {
            //it 's vote up
            reviewId = a.replace("voteUp", "")
            url = "/question/voteUpReview/" + questionId + "/" + reviewId
        }
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
                reviewId: reviewId
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                mainTable.empty()
                const answerId = responseMessage.newReviewInAnswer
                const newAnswerList = responseMessage.newAnswerList
                AnalysAnswerListToHTML(newAnswerList)
                $('[id^="ReviewNumber"]').hide();
                $("#ReviewNumberIdShow" + answerId).show()
            }
            else {
                alert("something wrong")
            }
        });
    })

    $(document).on('click', '.submitReview', function (event) {
        event.preventDefault();
        var a = $(this).attr("id");
        var questionId = quesId.text()
        var answerId = a.replace("submitReview", "");
        var url = "/question/addReview/" + answerId;
        var content = $('#reviewContent' + answerId).val();
        $('#reviewContent' + answerId).val("");
        if(!content || typeof content != 'string' || content.match(/^[ ]*$/)){
            alert("Can not submit blank data")
            return
        }
        console.log(content);
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: questionId,
                answerId: answerId,
                content: content
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            $('#myReview'+answerId).trigger('click');
            if (responseMessage.status === true) {
                const answerId = responseMessage.answerId
                const curReview = responseMessage.curReview
                var btValue=$('#'+answerId+"ReviewNumberId").text()
                btValue=btValue.replace(" reviews","")
                btValue=parseInt(btValue)+1
                btValue=btValue+" reviews"
                var curReviewId = curReview.reviewId
                var curReviewContent = curReview.content
                var curReviewRecentUpdatedTime = curReview.recentUpdatedTime
                var curReviewVoteUpNumber = curReview.voteUpNumber
                var curReviewVoteDownNumber = curReview.voteDownNumber
                var subTableTodyTr = "<tr>"
                var subTableTodyTr_td1 = "<td><p>" + curReviewContent + "</p></td>";
                var subTableTodyTr_ex = "<td></td>";
                var subTableTodyTr_td2 = "<td></td>";
                var subTableTodyTr_td3 = "<td></td>";
                var subTableTodyTr_td4 = "<td><p>" + curReviewRecentUpdatedTime + "</p></td>";
                var subTableTodyTr_td5 = "";
                var subTableTodyTr_td5_bt1 = "";
                var subTableTodyTr_td5_bt2 = "";
                if (curReview.voteUpJudge) {
                    subTableTodyTr_td5_bt1 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                } else {
                    subTableTodyTr_td5_bt1 = "<button class=\"reviewButtonUnVoted\" id=\"voteUp" + curReviewId + "\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                }
                if (curReview.voteDownJudge) {
                    subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                } else {
                    subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonUnVoted\" id=\"voteDn" + curReviewId + "\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                }
                subTableTodyTr_td5 = "<td>" + subTableTodyTr_td5_bt1 + "&nbsp;" + subTableTodyTr_td5_bt2 + "</td>"
                subTableTodyTr = subTableTodyTr_td1 + subTableTodyTr_ex + subTableTodyTr_td2 + subTableTodyTr_td3 + subTableTodyTr_td4 + subTableTodyTr_td5
                // subTableTody = subTableTody + subTableTodyTr + "</tr>"
                subTableTodyTr = "<tr>" + subTableTodyTr + "</tr>"
                $('#'+answerId+"ReviewNumberId").text(btValue)
                $('#ReviewNumberIdShow' + answerId).append(subTableTodyTr)
                $('#ReviewNumberIdShow' + answerId).show()
            }
            else {
                alert("submit failed,something wrong")
            }
        });
    })

    $(document).on('change', '.ReviewSorted', function (event) {
        event.preventDefault();
        // var questionId = quesId.text()
        var selected = $(this).children('option:selected').val();
        var answerId
        if (selected != '0') {
            var a = $(this).attr("id");
            answerId = a.replace("ReviewSorted", "")
            //ReviewNumberIdShow5fd82a4799eb7c385db27e68
            var tBodyReviews = "ReviewNumberIdShow" + a.replace("ReviewSorted", "")
            $('#' + tBodyReviews).empty()
            var url
            if (selected == '1') {
                url = "/question/sortReview/sortByRecent"
            } else if (selected == '2') {
                url = "/question/sortReview/sortByPopular"
            }
            var requestConfig = {
                method: 'POST',
                url: url,
                contentType: 'application/json',
                data: JSON.stringify({
                    // questionId: questionId,
                    answerId: answerId
                })
            };
            $.ajax(requestConfig).then(function (responseMessage) {
                if (responseMessage.status === true) {
                    const newReviewList = responseMessage.sortedReviewrList
                    // $('#' + tBodyReviews).append("<p>saddad</p>")
                    // var subTableTody="<tr>";
                    for (let index = 0; index < newReviewList.length; index++) {
                        var curReview = newReviewList[index];
                        var curReviewId = curReview.reviewId
                        var curReviewContent = curReview.content
                        var curReviewRecentUpdatedTime = curReview.recentUpdatedTime
                        var curReviewVoteUpNumber = curReview.voteUpNumber
                        var curReviewVoteDownNumber = curReview.voteDownNumber
                        var subTableTodyTr = "<tr>"
                        var subTableTodyTr_td1 = "<td><p>" + curReviewContent + "</p></td>";
                        var subTableTodyTr_ex = "<td></td>";
                        var subTableTodyTr_td2 = "<td></td>";
                        var subTableTodyTr_td3 = "<td></td>";
                        var subTableTodyTr_td4 = "<td><p>" + curReviewRecentUpdatedTime + "</p></td>";
                        var subTableTodyTr_td5 = "";
                        var subTableTodyTr_td5_bt1 = "";
                        var subTableTodyTr_td5_bt2 = "";
                        if (curReview.voteUpJudge) {
                            subTableTodyTr_td5_bt1 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                        } else {
                            subTableTodyTr_td5_bt1 = "<button class=\"reviewButtonUnVoted\" id=\"voteUp" + curReviewId + "\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                        }
                        if (curReview.voteDownJudge) {
                            subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                        } else {
                            subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonUnVoted\" id=\"voteDn" + curReviewId + "\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                        }
                        subTableTodyTr_td5 = "<td>" + subTableTodyTr_td5_bt1 + "&nbsp;" + subTableTodyTr_td5_bt2 + "</td>"
                        subTableTodyTr = subTableTodyTr_td1 + subTableTodyTr_ex + subTableTodyTr_td2 + subTableTodyTr_td3 + subTableTodyTr_td4 + subTableTodyTr_td5
                        // subTableTody = subTableTody + subTableTodyTr + "</tr>"
                        subTableTodyTr = "<tr>" + subTableTodyTr + "</tr>"
                        $('#' + tBodyReviews).append(subTableTodyTr)
                    }
                    // console.log(subTableTody);
                }
                else {
                    alert("something wrong")
                }
                $('#' + tBodyReviews).show()
            });

        }

    })

    answerSubmit.click(function (event) {
        event.preventDefault();
        var content = answerContent.val();
        if(!content || typeof content != 'string' || content.match(/^[ ]*$/)){
            alert("Can not submit blank data")
            return
        }
        const questionId = quesId.text()
        let url = '/question/addAnswer/' + questionId
        var requestConfig = {
            method: 'POST',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                content: content,
                questionId: questionId,
            })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if (responseMessage.status === true) {
                addAnswerSuccessful.show()
                addAnswerSuccessful.delay(3000).hide(0);
                mainTable.empty()
                const newAnswerList = responseMessage.newAnswerList
                AnalysAnswerListToHTML(newAnswerList)
                $('[id^="ReviewNumber"]').hide();
                addAnswerSuccessful.show()
                addAnswerSuccessful.delay(3000).hide(0);
                $("#answerContent").val("");
            }
            else {
                addAnswerFailed.show()
                addAnswerFailed.delay(3000).hide(0);
            }
        });
    });




    function AnalysAnswerListToHTML(newAnswerList) {
        const tableCaption = " <caption>Show your ideas</caption>"
        mainTable.append(tableCaption)
        let listLen = newAnswerList.length
        var tableThead = "<thead> <tr><th>" + listLen + " answers<button style=\"margin:5px\" class=\"btn btn-primary pull-right\" id=\"sortByRecent\">sorted by most recent</button><button style=\"margin:5px\" class=\"btn btn-primary pull-right\" id=\"sortByPopular\" >sorted by most popular</button></th> </tr> </thead>"
        mainTable.append(tableThead)
        var tableBody;

        mainTable.append("<tbody>")
        for (let index = 0; index < newAnswerList.length; index++) {
            const curAnswer = newAnswerList[index];
            const curAnswerId = curAnswer.answerId
            const curReviewList = curAnswer.reviews
            const curReviewListLen = curReviewList.length
            const curAnswerRecentUpdatedTime = curAnswer.recentUpdatedTime
            const curAnswerVoteUpNumber = curAnswer.voteUpNumber
            const curAnswerVoteDownNumber = curAnswer.voteDownNumber
            //sub tables
            var subTable = "<tr><td><table class=\"questionInnerTable\">"
            const curAnswerContent = curAnswer.content
            var subTableTr1_ex = " <td><select id=\"" + curAnswerId + "ReviewSorted\" class=\"ReviewSorted\">  <option value=\"0\" selected=\"selected\">Sort Reviews</option><option value=\"1\">Most recent</option><option value=\"2\">Most popular</option></select></td>"
            var subTableTr1_td1 = " <td class=\"questionInnerTableTr-1\"><p class=\"text-primary\">" + curAnswerContent + "</p></td>";
            var subTableTr1_td2 = " <td class=\"questionInnerTableTr-2\"><button class=\"ReviewNumberShowButton\" id=\"" + curAnswerId + "ReviewNumberId\">" + curReviewListLen + " reviews</button></td>";
            var subTableTr1_td3 = " <td><button class=\"btn\" data-toggle=\"modal\"data-target=\"#myReview" + curAnswerId + "\" type=\"button\">Review answer</button><div class=\"modal\" id=\"myReview" + curAnswerId + "\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\"><div class=\"modal-dialog\"><div class=\"modal-content\"><form><div class=\"modal-header\"> <button type=\"button\" class=\"close\"  data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button><h4 class=\"modal-title\">Please write down your ideas </h4> </div> <div class=\"modal-body\"><textarea class=\"form-control\" id=\"reviewContent" + curAnswerId + "\" rows=\"16\" style=\"min-width: 90%\" placeholder=\"Welcome to share your idea\"></textarea> </div><div class=\"modal-footer\"> <button type=\"button\"  id=\"closeButton" + curAnswerId + "\" data-dismiss=\"modal\">Close</button> <button type=\"button\" class=\"submitReview\" id=\"submitReview" + curAnswerId + "\">Save</button> </div> </form> </div> </div> </div>  </td>"
            var subTableTr1_td4 = "<td class=\"questionInnerTableTr-2\"> <p>" + curAnswerRecentUpdatedTime + "</p> </td>";
            var subTableTr1_td5_bt1 = ""
            if (curAnswer.voteUpJudge) {
                subTableTr1_td5_bt1 = " <button class=\"answerButtonVoted\" disabled=\"disabled\">Vote Up / " + curAnswerVoteUpNumber + "</button>"
            } else {
                subTableTr1_td5_bt1 = " <button class=\"answerButtonUnVoted\" id=\"voteUp" + curAnswerId + "\">Vote Up / " + curAnswerVoteUpNumber + "</button>"
            }
            var subTableTr1_td5_bt2 = ""
            if (curAnswer.voteDownJudge) {
                subTableTr1_td5_bt2 = "<button class=\"answerButtonVoted\" disabled=\"disabled\">Vote Down / " + curAnswerVoteDownNumber + "</button>"
            } else {
                subTableTr1_td5_bt2 = "<button class=\"answerButtonUnVoted\" id=\"voteDn" + curAnswerId + "\">Vote Down / " + curAnswerVoteDownNumber + "</button>"
            }
            var subTableTr1_td5 = " <td class=\"questionInnerTableTr-2\">" + subTableTr1_td5_bt1 + "&nbsp;" + subTableTr1_td5_bt2 + "</td>";
            var subTableTr1 = "<tr>" + subTableTr1_td1 + subTableTr1_ex + subTableTr1_td2 + subTableTr1_td3 + subTableTr1_td4 + subTableTr1_td5 + "</tr>";
            // var subTableTr2 = "<tr></tr>";
            var subTableTr2 = "";
            var subTableTody = " <tbody id=\"ReviewNumberIdShow" + curAnswerId + "\" class=\"ReviewNumberShow\">";
            for (let index2 = 0; index2 < curReviewList.length; index2++) {
                var curReview = curReviewList[index2];
                var curReviewId = curReview.reviewId
                var curReviewContent = curReview.content
                var curReviewRecentUpdatedTime = curReview.recentUpdatedTime
                var curReviewVoteUpNumber = curReview.voteUpNumber
                var curReviewVoteDownNumber = curReview.voteDownNumber
                var subTableTodyTr = "<tr>"
                var subTableTodyTr_td1 = "<td><p>" + curReviewContent + "</p></td>";
                var subTableTodyTr_ex = "<td></td>";
                var subTableTodyTr_td2 = "<td></td>";
                var subTableTodyTr_td3 = "<td></td>";
                var subTableTodyTr_td4 = "<td><p>" + curReviewRecentUpdatedTime + "</p></td>";
                var subTableTodyTr_td5 = "";
                var subTableTodyTr_td5_bt1 = "";
                var subTableTodyTr_td5_bt2 = "";
                if (curReview.voteUpJudge) {
                    subTableTodyTr_td5_bt1 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                } else {
                    subTableTodyTr_td5_bt1 = "<button class=\"reviewButtonUnVoted\" id=\"voteUp" + curReviewId + "\">Vote Up / " + curReviewVoteUpNumber + "</button>"
                }
                if (curReview.voteDownJudge) {
                    subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonVoted\" disabled=\"disabled\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                } else {
                    subTableTodyTr_td5_bt2 = " <button class=\"reviewButtonUnVoted\" id=\"voteDn" + curReviewId + "\">Vote Down / " + curReviewVoteDownNumber + "</button>"
                }
                subTableTodyTr_td5 = "<td>" + subTableTodyTr_td5_bt1 + "&nbsp;" + subTableTodyTr_td5_bt2 + "</td>"
                subTableTodyTr = subTableTodyTr_td1 + subTableTodyTr_ex + subTableTodyTr_td2 + subTableTodyTr_td3 + subTableTodyTr_td4 + subTableTodyTr_td5
                subTableTody = subTableTody + subTableTodyTr + "</tr>"
            }
            subTableTody = subTableTody + "</tbody>"
            var subTableFarmwork = subTableTr1 + subTableTr2 + subTableTody
            subTable = subTable + subTableFarmwork
            subTable = subTable + "</talbe></td></tr>"
            mainTable.append(subTable)
        }

        mainTable.append("</tbody>")
    }


})(jQuery);