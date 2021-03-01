const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { accountTypes } = require('../config/accounts');

const accountSchema = mongoose.Schema(
  {
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    accountType: {
        type: String,
        enum: accountTypes,
        default: 'savings'
    },
    balance: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accountSchema.plugin(toJSON);
accountSchema.plugin(paginate);


/**
 * Check if account with userId already present
 * @param {string} userId - The user's id
 * @param {string} accountType - account type
 * @returns {Promise<boolean>}
 */
accountSchema.statics.isAccountExist = async function (userId, accountType) {
    const user = await this.find({userId: userId, accountType: accountType});
    let isThere;
    isThere = true ? user.length>0 : false;
    return isThere;
  };


/**
 * Check if basicSaving account balance less that Rs. 50000
 * @param {number} balance - balance entered while creating account
 * @returns {Promise<boolean>}
 */
accountSchema.statics.checkForBasicSavings = async function (balance) {
    if(balance > 5000000){
        return true;
    }
    return false;
  };

/**
 * @typedef Account
 */
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
