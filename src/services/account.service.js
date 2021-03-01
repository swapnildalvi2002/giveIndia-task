const httpStatus = require('http-status');
const { Account } = require('../models');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');


/**
 * Create a account
 * @param {Object} accountBody
 * @returns {Promise<Account>}
 */
const createAccount = async (accountBody) => {
    if (await Account.isAccountExist(accountBody.userId, accountBody.accountType)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Account with account type and userId already present');
    }
    if (accountBody.accountType == "basicSavings") {
        if(await Account.checkForBasicSavings(accountBody.balance)){
            throw new ApiError(httpStatus.BAD_REQUEST, 'Basic saving account should not exceed amount Rs. 50,000 ');
        }
    }
    
  const account = await Account.create(accountBody);
  return account;
};

/**
 * Query for accounts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAccounts = async (filter, options) => {
  const account = await Account.paginate(filter, options);
  return account;
};

/**
 * Get account by id
 * @param {ObjectId} id
 * @returns {Promise<Account>}
 */
const getAccountById = async (id) => {
  return Account.findById(id);
};

/**
 * Get account by email
 * @param {ObjectId} userId
 * @returns {Promise<Account>}
 */
const getAccountByUserId = async (userId) => {
  return Account.find({ userId: userId });
};

/**
 * Update account by id
 * @param {ObjectId} accountId
 * @param {Object} updateBody
 * @returns {Promise<Account>}
 */
const updateAccountById = async (accountId, updateBody) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  if (updateBody.email && (await Account.isEmailTaken(updateBody.email, accountId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(account, updateBody);
  await account.save();
  return account;
};

/**
 * Delete account by id
 * @param {ObjectId} accountId
 * @returns {Promise<Account>}
 */
const deleteAccountById = async (accountId) => {
  const account = await getAccountById(accountId);
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Account not found');
  }
  await account.remove();
  return account;
};

/** 
 * Transfers between accounts
 * @param {string} senderAccountId
 * @param {string} receiverAccountId
 * @param {number} amount
 * @returns {Promise<Account>}
*/
const handleMoneyTransfer = async (senderAccountId, receiverAccountId, amount) => {
  const saccount = await getAccountById(senderAccountId);
    if (!saccount) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Sender account not found');
    }

    const raccount = await getAccountById(receiverAccountId);
    if (!raccount) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Receiver account not found');
    }

    let senderData = await getAccountById(senderAccountId);
    let receiverData = await getAccountById(receiverAccountId);
    console.log(senderData, receiverData);
    if (senderData.userId.equals(receiverData.userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Transaction can not perform between same user\'s account types');
    }
    if (senderData.balance < amount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'In-sufficient balance to perform transaction');
    }
    if (receiverData.accountType == 'basicSavings') {
      console.log("receiver accountis basic savings");
      let checkBeforeAdd = receiverData.balance + amount;
      if(checkBeforeAdd>5000000) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Transaction can not perform as receiver basicSavings account limit will exceed.');
      }
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // always pass session to find queries when the data is needed for the transaction session
      const sender = await Account.findById(senderAccountId).session(session);
      
      // calculate the updated sender balance
      sender.balance = $(sender.balance).subtract(amount);
      
      // if funds are insufficient, the transfer cannot be processed
      if (sender.balance < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Account - ${sender.name} has insufficient funds`);
        //throw new Error(`Account - ${sender.name} has insufficient funds`);
      }
      
      // save the sender updated balance
      // do not pass the session here
      // mongoose uses the associated session here from the find query return
      // more about the associated session ($session) later on
      await sender.save();
      
      const receiver = await Account.findById(receiverAccountId).session(session);
      //const receiver = await Account.findOne({ accountId: receiverAccountId }).session(session);
      
      receiver.balance = $(receiver.balance).add(amount);
      
      await receiver.save();
      
      // commit the changes if everything was successful
      await session.commitTransaction();
      session.endSession();
       /* 
        * newSrcBalance: The balance in source account after transfer
        * totalDestBalance: The total balance in all accounts of destination user combined
        * transferedAt: timestamp 
        * */
      let senderData = await getAccountById(senderAccountId);
      let receiverAllAccounts = await getAccountByUserId(receiverData.userId);
      let receiverTotalBalance = receiverAllAccounts.reduce(function(prev, current) {
        return prev.balance + current.balance;
      });

      let obj = {
        newSrcBalance: senderData.balance,
        totalDestBalance: receiverTotalBalance,
        transferedAt: senderData.updatedAt
      }

      console.log(obj);
      
      return obj;
    } catch (error) {
      // if anything fails above just rollback the changes here
    
      // this will rollback any changes made in the database
      await session.abortTransaction();
      
      // logging the error
      console.error(error);
      
      // rethrow the error
      throw error;
    } 
  }

module.exports = {
  createAccount,
  queryAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
  handleMoneyTransfer
};
