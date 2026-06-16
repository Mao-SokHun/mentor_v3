import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const BakongPayment = sequelize.define('BakongPayment', {
  bakong_payments_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Bakong_NO_reference: {
    type: DataTypes.STRING(255),
    field: 'Bakong_NO_reference'
  },
  bakong_account_id: {
    type: DataTypes.STRING,
    field: 'bakong_account_id'
  },
  total_paid: {
    type: DataTypes.DECIMAL
  },
  status: {
    type: DataTypes.STRING
  },
  create_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'Bakong_payment',
  timestamps: false
});

export default BakongPayment;
