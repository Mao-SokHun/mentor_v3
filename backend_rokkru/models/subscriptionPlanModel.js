import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  subscription_plan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  duration_day: {
    type: DataTypes.DATE // Represented as datetime in DBML. Note: If this is day duration (integer), it can be adjusted accordingly.
  },
  description: {
    type: DataTypes.STRING(255)
  },
}, {
  tableName: 'subscription_plan',
  timestamps: false
});

export default SubscriptionPlan;
