import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const Skill = sequelize.define('Skill', {
  skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  skill_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  skill_name_kh: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  update_date: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'skill',
  timestamps: false,
});

export default Skill;
