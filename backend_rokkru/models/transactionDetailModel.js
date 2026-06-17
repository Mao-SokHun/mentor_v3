import { DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

const TransactionDetail = sequelize.define('TransactionDetail', {
  payment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subscription_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  md5_hash: {
    type: DataTypes.STRING
  },
  bank_tx_id: {
    type: DataTypes.STRING
  },
  paid_account: {
    type: DataTypes.STRING
  },
  account_no: {
    type: DataTypes.INTEGER,
    field: 'account_no'
  },
  recive_account: {
    type: DataTypes.STRING,
    field: 'recive_account'
  },
  remark: {
    type: DataTypes.STRING
  },
  transaction_id: {
    type: DataTypes.INTEGER,
    field: 'transaction_id'
  }
}, {
  tableName: 'Transaction_detail',
  timestamps: false
});

export default TransactionDetail;
