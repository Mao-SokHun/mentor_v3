import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const CommunityHistory = sequelize.define('CommunityHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_com_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  community_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  domain_id: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  media: {
    type: DataTypes.TEXT
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  edit_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'community_history',
  timestamps: false
});

export default CommunityHistory;
