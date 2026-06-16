import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const UserSession = sequelize.define('UserSession', {
  session_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  refresh_token_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  device_info: {
    type: DataTypes.STRING(255)
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'user_sessions',
  timestamps: false
});

export default UserSession;
