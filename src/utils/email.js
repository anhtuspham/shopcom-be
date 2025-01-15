import nodemailer from 'nodemailer'


import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.APP_PASSWORD,
    },
});

export async function sendEmail(to, subject, htmlContent) {
    try {
        await transporter.sendMail({
            from: `"Together" <${process.env.MAIL_ADDRESS}>`,
            to,
            subject,
            html: htmlContent,
        });
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
    }
}

