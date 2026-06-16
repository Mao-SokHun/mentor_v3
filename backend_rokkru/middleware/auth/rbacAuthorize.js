import UserType from "../../models/userTypeModel.js";
import User from "../../models/userModel.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("User: ", req.user);
    
    if (!req.user){
      return res.status(401).json({
        message: "Unauthorized",
      })
    }
    
    const userRole = req.user.role;

    if(!userRole){
      return res.status(403).json({
        message: "Role not found",
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Role is invalid",
      });
    }

    next();
  };
};