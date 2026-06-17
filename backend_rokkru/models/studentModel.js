import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const Student = sequelize.define('Student', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  firstname: {
    type: DataTypes.STRING(100)
  },
  lastname: {
    type: DataTypes.STRING(100)
  },
  phone_number: {
    type: DataTypes.STRING(100)
  },
  study_major: {
    type: DataTypes.STRING(100)
  },
  university: {
    type: DataTypes.STRING(150)
  },
  description: {
    type: DataTypes.STRING(200)
  },
  profile_picture: {
    type: DataTypes.TEXT
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  },
}, {
  tableName: 'student',
  timestamps: false
});

export default Student;
