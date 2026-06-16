import jwt from 'jsonwebtoken';

export const generateToken = (user_id) => {
    return jwt.sign({user_id}, process.env.JWT_SECRET,{
        expiresIn: '7d'
    });
}

export const cookieOptions = {
    httpOnly : true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

export const generateOTP = () =>{
    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();
};