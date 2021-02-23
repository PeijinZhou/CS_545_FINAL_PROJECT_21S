const nodemailer = require('nodemailer');

const config = {
        host: 'smtp.qq.com', 
        port: 587,
        auth: {
            user: 'wuhd2000@qq.com', 
            pass: 'sngmlobakgiibecd'
            //will be deactived after project
        }
    };

const transporter = nodemailer.createTransport(config);

async function send (address, subject, text ){
    const emailReg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/; 
    if(!emailReg.test(address)) throw("Error: Please check email address.");
    if(typeof subject != "string" && subject.trim == "") throw("Error:  Please check subject.")
    if(typeof text != "string" && text.trim == "") throw("Error:  Please check text.")
    const mail = {
        from: "Q&A<wuhd2000@qq.com>",
        subject: subject,
        to: address,
        text: text
    };
    let status = true;
    try {
        transporter.sendMail(mail, function(error, info){
            if(error) throw (error);
            // console.log('mail sent:', info.response);
        });
    } catch (error) {
        status = false;
    }
    //backup the email
    let recordMail = {
        from: "Q&A<wuhd2000@qq.com>",
        subject: `Send ${subject} to ${address}`,
        to: "wuhd2000@qq.com",
        text: text
    }
    transporter.sendMail(recordMail, function(error, info){
        if(error) {
            return false;
        }
        return true;
        // console.log('mail sent:', info.response);
    });

    if(status === true) return true;
    else return false;
};


// async function main(){
//     try {
//         await send("wuhd1234@gmail.com","haha","this is me");
//     } catch (error) {
//         console.log(error);
//     }
// }
// main();
module.exports = {send};
