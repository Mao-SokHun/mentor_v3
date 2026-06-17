import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const SubSkill = sequelize.define('SubSkill', {
  sub_skill_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sub_skill_name: {
    type: DataTypes.STRING(100),
    allowNull: true, 
  },
  sub_skill_name_kh: {
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
  tableName: 'sub_skill',
  timestamps: false,
});

export default SubSkill;
