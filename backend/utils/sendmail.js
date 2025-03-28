
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // From environment variables
            pass: process.env.EMAIL_PASS,  // From environment variables
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
