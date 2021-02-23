(function ($) {

    const elementEmail = $("#email");
    const elementError = $("#error");
    const resetSuccess = $("#resetSuccess");
    const progressBar = $("#progressBar");
    const elementResetButton = $("#resetButton");
    const emailStatus = $("#emailStatus");

    //init
    hideStatus();


    //bind 
    elementEmail.focusout(function() {
        validateEmail();

    });
    
    elementResetButton.click(function(event){
        event.preventDefault();
        validateEmail();
        if(!validateAll()){
            return;
        }
        progressBar.attr("class","progress-bar");
        progressBar.show();
        let i = 0;
        let timer = setInterval(function(){
            progressBar.attr("style",`width:${i}0%`);
            progressBar.html(`${i}0%`);
            i += 1;
            if(i === 10)
                clearInterval(timer);
        },400)
 

        let targetUrl = "/reset";
        let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
            email: elementEmail.val(),
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                clearInterval(timer);
                progressBar.attr("class","progress-bar progress-bar-success");
                progressBar.attr("style",`width:100%`);
                progressBar.html(`100%`);
                resetSuccess.text("New password has been send to your email.");
                resetSuccess.show();
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
                
            }
            else{
                clearInterval(timer);
                progressBar.hide();
                elementError.empty();
                for(let i = 0; i < responseMessage.error.length; i++){
                    let listItem = $(`<li>${responseMessage.error[i]}</li>`);
                    elementError.append(listItem);
                }
                elementError.show();
            } 
        });
    });


    //functions

    function hideStatus(){
        elementError.hide();
        emailStatus.hide();
        progressBar.hide();
    }
    function setStatusTextandClass(element, text, style){
        element.text(text);
        element.attr("class", style);
        element.show();
    }


    function validateAll(){
        elementError.hide();
        if(emailStatus.attr("class") === "text-danger"){
            elementResetButton.attr("disabled","true");
            return false;
        }else{
            elementResetButton.removeAttr("disabled");
            return true;
        }
    }
    
    function validateEmail(){
        const email = elementEmail.val();
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if(!emailPattern.test(email)){
            setStatusTextandClass(emailStatus, "Please input valid email address.", "text-danger")
            return;
        }

        let targetUrl = `/reset/validateUserEmail/${email}`;
        let requestConfig = {
            method: 'GET',
            url: targetUrl
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                setStatusTextandClass(emailStatus, "This email is available.","text-success");
                elementResetButton.removeAttr("disabled");
                return;
            }else{
                setStatusTextandClass(emailStatus, responseMessage.error,"text-danger");
                return;
            }
        });
    }
})(window.jQuery);
