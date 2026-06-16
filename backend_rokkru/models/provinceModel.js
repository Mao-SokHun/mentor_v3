import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const Province = sequelize.define('Province', {
  province_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  province_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'province',
  timestamps: false
});

export default Province;
