const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1) Create a Transporter
    //console.log(options);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    //2) Define Email options
    const mailOptions = {
        from:'Jonas Schmedtmann <hello2000@jonas.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html:
    };

    //console.log(mailOptions);
    //3) Send the email
    await transporter.sendMail(mailOptions);
    


};

module.exports = sendEmail;