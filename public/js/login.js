(function ($) {

    const elementEmail = $("#email");
    const elementPassword = $("#password");
    const elementError = $("#error");
    const loginSuccess = $("#loginSuccess");
    const progressBar = $("#progressBar");
    const elementLoginButton = $("#loginButton");
    const emailStatus = $("#emailStatus");
    const passwordStatus = $("#passwordStatus");

    //init
    hideStatus();


    //bind 
    elementEmail.focusout(function() {
        validateEmail();
        validateAll();

    });
    elementPassword.focusout(function() {
        validatePassword();
        validateAll();
    });

    elementLoginButton.click(function(event){
        event.preventDefault();
        validateEmail();
        validatePassword();
        if(!validateAll()){
            return;
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
        },400)
 

        let targetUrl = "/login";
        let requestConfig = {
        method: 'POST',
        url: targetUrl,
        contentType: 'application/json',
        data: JSON.stringify({
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
                loginSuccess.text("You have successfully logged in and will automatically jump to the home page");
                loginSuccess.show();
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
                //elementError.append($("<li>Please input right password.</li>"));
                elementError.show();
            } 
        });
    });


    //functions

    function hideStatus(){
        elementError.hide();
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
        if(emailStatus.attr("class") === "text-danger" || passwordStatus.attr("class") === "text-danger"){
            elementLoginButton.attr("disabled","true");
            return false;
        }else{
            elementLoginButton.removeAttr("disabled");
            return true;
        }
    }
    
    function validateEmail(){
        const email = elementEmail.val().trim();
        let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if(!emailPattern.test(email)){
            setStatusTextandClass(emailStatus, "Please input valid email address.", "text-danger")
            return;
        }

        let targetUrl = `/login/validateUserEmail/${email}`;
        let requestConfig = {
            method: 'GET',
            url: targetUrl
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === "true"){
                setStatusTextandClass(emailStatus, "This email is available.","text-success");
                return;
            }else{
                setStatusTextandClass(emailStatus, responseMessage.error,"text-danger");
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
        else{
            setStatusTextandClass(passwordStatus, "This password is valid.","text-success");
            return;
        }
    }
})(window.jQuery);
