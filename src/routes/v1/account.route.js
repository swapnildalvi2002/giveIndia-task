const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const accountValidation = require('../../validations/account.validation');
const accountController = require('../../controllers/account.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageAccount'), validate(accountValidation.createAccount), accountController.createAccount)
  .get(auth('getAccount'), validate(accountValidation.getAccounts), accountController.getAccounts);

router
  .route('/:accountId')
  .get(auth('getAccount'), validate(accountValidation.getAccount), accountController.getAccount)
  .patch(auth('manageAccount'), validate(accountValidation.updateAccount), accountController.updateAccount)
  .delete(auth('manageAccount'), validate(accountValidation.deleteAccount), accountController.deleteAccount);

router
  .route('/transfer')
  .post(auth('transferAmount'), validate(accountValidation.transferAmount), accountController.handleMoneyTransfer)

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management and retrieval
 */

/**
 * @swagger
 * path:
 *  /account:
 *    post:
 *      summary: Create a account
 *      description: Only admins can create accounts.
 *      tags: [Accounts]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - userId
 *                - accountType
 *                - balance
 *              properties:
 *                userId: string
 *                accountType:
 *                  type: string
 *                  enum: ['savings', 'current', 'basicSavings']
 *                balance:
 *                  type: number
 *              example:
 *                userId: 60336aed0ed498731c8bb35f
 *                accountType: savings
 *                balance: 200000
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Account'
 *        "400":
 *          $ref: '#/components/responses/AccountAlreadyPresent'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 * /account/transfer:
 *    post:
 *      summary: Transfer between account
 *      description: User can perform money transfer to other accounts.
 *      tags: [Accounts]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - fromAccountId
 *                - toAccountId
 *                - amount
 *              properties:
 *                fromAccountId: string
 *                toAccountId: string
 *                amount:
 *                  type: number
 *              example:
 *                fromAccountId: 603760a54c01536418d1afcf
 *                toAccountId: 603745685f8f69864c4ad82b
 *                amount: 9909
 *      responses:
 *        "201":
 *          description: Transaction
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Account'
 *        "400":
 *          $ref: '#/components/responses/AccountAlreadyPresent'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 */
