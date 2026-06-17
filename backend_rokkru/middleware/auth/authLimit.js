import rateLimit from "express-rate-limit";

export const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.LOGINLIMIT,

    message: {
        message: "Too many login!, Try again in 15 minutes.", 
    },

    standardHeaders: true,
    legacyHeaders: false,
});

export const registerLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: process.env.REGISTERLIMIT,

    message: {
        message:  "Too many regsiter!, Try again in 15 minutes.",
    },

    standardHeaders: true,
    legacyHeaders: false,
});

export const otpLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.OTPLIMIT,

    message: {
        message: "Too many OTP attempts. Please try again in 15 minutes.",
    },

    standardHeaders: true,
    legacyHeaders: false,
});