import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const MentorPortfolio = sequelize.define('MentorPortfolio', {
  mentor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING(250),
    primaryKey: true,
    allowNull: false
  },
  link_tag: {
    type: DataTypes.STRING(250)
  }
}, {
  tableName: 'mentor_portfolio',
  timestamps: false
});

export default MentorPortfolio;
