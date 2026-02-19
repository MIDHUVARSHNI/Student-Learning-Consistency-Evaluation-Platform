const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // secure: true for 465, false for other ports
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other services or generic SMTP
        auth: {
            user: process.env.EMAIL_USERNAME, // Set this in .env
            pass: process.env.EMAIL_PASSWORD, // Set this in .env
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@slcep.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
