import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const OTP = sequelize.define("OTP", {
  code: {
    type: DataTypes.STRING,
  },
  expires_at: {
    type: DataTypes.DATE,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'OTPs'
});

export default OTP;