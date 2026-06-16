import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const AccountHistory = sequelize.define('AccountHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  old_email: {
    type: DataTypes.STRING(100)
  },
  old_password: {
    type: DataTypes.STRING(255)
  },
  change_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'account_history',
  timestamps: false
});

export default AccountHistory;
