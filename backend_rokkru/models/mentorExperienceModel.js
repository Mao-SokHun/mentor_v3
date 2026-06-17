import { DataTypes } from "sequelize";
import sequelize from "../config/config.js";

const MentorExperience = sequelize.define(
  "MentorExperience",
  {
    mentor_experience_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mentor_position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mentor_organization: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mentor_year: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    experience_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'education',
    },
  },
  {
    tableName: "mentor_experiences",
    timestamps: false,
  }
);

export default MentorExperience;
