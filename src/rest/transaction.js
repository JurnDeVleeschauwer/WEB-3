const transactionService = require('../service/transaction.js');

const getAllTransaction = async (ctx) => {
    ctx.body = await getAll();
};