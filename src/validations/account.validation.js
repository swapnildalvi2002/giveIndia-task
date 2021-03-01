const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAccount = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    accountType: Joi.string().required().valid('savings', 'current', 'basicSavings'),
    balance: Joi.number().integer(),
  }),
};

const getAccounts = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    accountType: Joi.string(),
    balance: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    accountId: Joi.required().custom(objectId),
  }),
};

const updateAccount = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    accountId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
        accountType: Joi.string(),
        balance: Joi.number().integer(),
    })
    .min(1),
};

const deleteAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
};
