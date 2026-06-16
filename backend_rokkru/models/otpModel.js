import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const OTP = sequelize.define("OTP", {
  code: {
    type: DataTypes.STRING,
  },
  expiresAt: {
    type: DataTypes.DATE,
  },
  UserId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'OTPs'
});

export default OTP;