import jwt from 'jsonwebtoken';
import User from '../../models/userModel.js';
import UserType from '../../models/userTypeModel.js';

export const protect = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return res.status(401).json({
                message: 'Not authorized, no token'
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decode.user_id, {
            include: UserType,
        });

        if (!user) {
            return res.status(401).json(
                {
                    message: 'Unauthorized, user not found'
                }
            )
        }
        req.user = {
            user_id: user.user_id,
            email: user.email,
            status: user.status,
            user_type_id: user.user_type_id,
            role: user.UserType?.user_type_name?.toLowerCase(),
        };
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: "Invalid Token"
        });
    }
}