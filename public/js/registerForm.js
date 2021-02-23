(function ($) {
    const elementUserName = $("#userName");
    const elementEmail = $("#email");
    const elementPassword = $("#password");
    const elementError = $("#error");
    const registerSuccess = $("#registerSuccess");
    const progressBar = $("#progressBar");
    const elementRegisterButton = $("#registerButton");
    const userNameStatus = $("#userNameStatus");
    const emailStatus = $("#emailStatus");
    const passwordStatus = $("#passwordStatus");
    
    //init
    hideStatus();

    

    //bind 
    elementUserName.focusout(function() {
        validateUserName();
        
    });
    elementEmail.focusout(function() {
        validateEmail();

    });
    elementPassword.focusout(function() {
        validatePassword();
    });
    elementRegisterButton.click(function(event){
        event.preventDefault();
        validateUserName();
        validateEmail();
        validatePassword();
        if(validateAll()){
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
 

        let targetUrl = "/registration";
        let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
            userName : elementUserName.val(),
            email: elementEmail.val(),
            password: elementPassword.val()
        })
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                clearInterval(timer);
                progressBar.attr("class","progress-bar progress-bar-success");
                progressBar.attr("style",`width:100%`);
                progressBar.html(`100%`);
                registerSuccess.text("You have successfully registered and will automatically jump to the home page");
                registerSuccess.show();
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
    }else{
        progressBar.hide();
        elementError.show();
    }
    });

    //functions
    function hideStatus(){
        elementError.hide();
        userNameStatus.hide();
        emailStatus.hide();
        passwordStatus.hide();
        progressBar.hide();
    }
    function setStatusTextandClass(element, text, style){
        element.text(text);
        element.attr("class", style);
        element.show();
    }


    function validateAll(){
        elementError.empty();
        elementError.hide();
        if(userNameStatus.attr("class") === "text-danger" || emailStatus.attr("class") === "text-danger" || passwordStatus.attr("class") === "text-danger"){
            elementRegisterButton.attr("disabled","true");
            return false;
        }else{
            elementRegisterButton.removeAttr("disabled");
            return true;
        }
    }
    function validateUserName(){
        const userName = elementUserName.val().trim();
        let userNamePattern = /^[\w_-]{3,16}$/;
        if(!userNamePattern.test(userName)){
            setStatusTextandClass(userNameStatus, "Please input valid user name.", "text-danger")
            return;
        }

        let targetUrl = `/registration/validateUserName/${userName}`;
        let requestConfig = {
            method: 'GET',
            url: targetUrl
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                setStatusTextandClass(userNameStatus, "This user name is available.","text-success");
                validateAll();
                return;
            }else{
                setStatusTextandClass(userNameStatus, responseMessage.error,"text-danger");
                validateAll();
                return;
            }
        });
    }
    function validateEmail(){
        const email = elementEmail.val();
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if(!emailPattern.test(email)){
            setStatusTextandClass(emailStatus, "Please input valid email address.", "text-danger")
            return;
        }

        let targetUrl = `/registration/validateUserEmail/${email}`;
        let requestConfig = {
            method: 'GET',
            url: targetUrl
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                setStatusTextandClass(emailStatus, "This email is available.","text-success");
                validateAll();
                return;
            }else{
                setStatusTextandClass(emailStatus, responseMessage.error,"text-danger");
                validateAll();
                return;
            }
        });
    }
    function validatePassword(){
        const password = elementPassword.val().trim();
        let passwordPattern = /^[\w_-]{3,16}$/;
        if(!passwordPattern.test(password)){
            setStatusTextandClass(passwordStatus, "Please input valid password.", "text-danger")
            return;
        }
        if(password.trim().length < 3 || password.trim().length > 16){
            setStatusTextandClass(passwordStatus, "Please use 3-16 characters long password.", "text-danger")
            validateAll();
            return;
        }
        else{
            setStatusTextandClass(passwordStatus, "This password is valid.","text-success");
            validateAll();
            return;
        }
    }

})(window.jQuery);