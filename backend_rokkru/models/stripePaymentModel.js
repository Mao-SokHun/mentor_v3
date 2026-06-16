import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const StripePayment = sequelize.define('StripePayment', {
  stripe_payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // User must be logged in to subscribe
  },
  subscription_id: {
    type: DataTypes.INTEGER,
  },
  stripe_checkout_session_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  stripe_payment_intent_id: {
    type: DataTypes.STRING(255),
  },
  stripe_receipt_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'usd',
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending',
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  update_date: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'stripe_payments',
  timestamps: false,
});

export default StripePayment;
