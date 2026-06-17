import nodemailer from "nodemailer";
import { otpEmailTemplate } from "./emailTemplate.js";


export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


export const sendEmail = async (email, code) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Confirmation Code",
        html: otpEmailTemplate(code, email),
    });
};
