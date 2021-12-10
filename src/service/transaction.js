const config = require('config');
const { getChildLogger } = require('../core/logging');
const transactionRepository = require('../repository/transaction');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

const debugLog = (message, meta = {}) => {
    if (!this.logger) this.logger = getChildLogger('transaction-service');
    this.logger.debug(message, meta);
};

/**
 * Get all `limit` transactions, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of transactions to fetch.
 * @param {number} [offset] - Nr of transactions to skip.
 */
const getAll = async (
    limit = DEFAULT_PAGINATION_LIMIT,
    offset = DEFAULT_PAGINATION_OFFSET,
) => {
    debugLog('Fetching all transactions', { limit, offset });
    const data = await transactionRepository.findAll({ limit, offset });
    const count = await transactionRepository.findCount();
    return {
        data,
        count,
        limit,
        offset
    };
};

/**
 * Get the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to find.
 */
const getById = async (id) => {
    debugLog(`Fetching transaction with id ${id}`);
    const transaction = await transactionRepository.findById(id);

    if (!transaction) {
        throw new Error(`There is no transaction with id ${id}`);
    }

    return transaction;
};

/**
 * Create a new transaction, will create a new product if necessary.
 *
 * @param {object} transaction - The transaction to create.
 * @param {string} transaction.amount - Amount deposited/withdrawn.
 * @param {Date} transaction.date - Date of the transaction.
 * @param {string} transaction.productId - Id of the product the transaction happened.
* @param {string} [transaction.userId] - Id of the user who did the transaction.
 */
const create = async ({ amount, date, productId, userId }) => {
    debugLog('Creating new transaction', { amount, date, productId, userId });


    return transactionRepository.create({
        amount,
        date,
        productId,
        userId,
    });
};

/**
 * Update an existing transaction, will create a new product if necessary.
 *
 * @param {string} id - Id of the transaction to update.
 * @param {object} transaction - The transaction data to save.
 * @param {string} [transaction.amount] - Amount deposited/withdrawn.
 * @param {Date} [transaction.date] - Date of the transaction.
 * @param {string} [transaction.productId] - Id of the product the transaction happened.
 * @param {string} [transaction.userId] - Name of the user who did the transaction.
 */
const updateById = async (id, { amount, date, productId, userId }) => {
    debugLog(`Updating transaction with id ${id}`, {
        amount,
        date,
        productId,
        userId,
    });


    return transactionRepository.updateById(id, {
        amount,
        date,
        productId,
        userId,
    });
};

/**
 * Delete the transaction with the given `id`.
 *
 * @param {number} id - Id of the transaction to delete.
 */
const deleteById = async (id) => {
    debugLog(`Deleting transaction with id ${id}`);
    await transactionRepository.deleteById(id);
};

module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
};