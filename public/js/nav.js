(function ($) {
    // const navLeft = $('#nav_left');
    const navRight1 = $('#nav_right_1');
    const navRight2 = $('#nav_right_2');

    //active current button
    const path = $(location).attr('pathname');
    const currentPage = $(`#nav_left a[href$="${path}"]`).parent();
    currentPage.addClass("active");

    //check login
    let targetUrl = "/user/getUserStatus";
        let requestConfig = {
            method: 'GET',
            url: targetUrl,
            contentType: 'application/json'
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            if(responseMessage.status === true){
                let userName = responseMessage.userName;
                navRight1.text("Log Out");
                navRight1.attr("href","/logout");
                navRight2.text(`Hello ${userName}`);
                navRight2.removeAttr("href");
            }
        });
})(window.jQuery);