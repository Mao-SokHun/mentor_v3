import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const MentorRating = sequelize.define('MentorRating', {
  rating_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false
  },
  mentor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mentor_rating',
  timestamps: false
});

export default MentorRating;
