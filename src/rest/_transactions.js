const Router = require('@koa/router');
const transactionService = require('../service/transaction');


/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Represents a transaction that was placed by user
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - amount
 *             - date
 *             - user
 *             - product
 *           properties:
 *             name:
 *               type: "string"
 *             date:
 *               type: "string"
 *               format: date-time
 *             product:
 *               $ref: "#/components/schemas/Product"
 *             user:
 *               $ref: "#/components/schemas/User"
 *           example:
 *             $ref: "#/components/examples/Transaction"
 *   examples:
 *     Transaction:
 *       id: "7b25d1fc-a15c-49bd-8d3f-6365bfa1ca04"
 *       amount: 3000
 *       date: "2021-05-28T14:27:32.534Z"
 *       product:
 *         $ref: "#/components/examples/Product"
 *       user:
 *         $ref: "#/components/examples/User"
 *  
 */


/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (paginated)
 *     tags:
 *     - Transactions
 *     parameters:
 *           - $ref: "#/components/parameters/limitParam"
 *           - $ref: "#/components/parameters/offsetParam" 
 *     requestBody:
 *       $ref: "#/components/requestBodies/Transaction"
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/TransactionsList"
 */
const getAllTransactions = async (ctx) => {
    const limit = ctx.query.limit && Number(ctx.query.limit);
    const offset = ctx.query.offset && Number(ctx.query.offset);
    ctx.body = await transactionService.getAll(limit, offset);
};


/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Creates a new transaction for the signed in user.
 *     tags:
 *      - Transactions
 *     requestBody:
 *       $ref: "#/components/requestBodies/Transaction"
 *     responses:
 *       200:
 *         description: The created transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 */
const createTransaction = async (ctx) => {
    const newTransaction = await transactionService.create({
        ...ctx.request.body,
        date: new Date(ctx.request.body.date),
    });
    ctx.body = newTransaction;
    ctx.status = 201;
};

const getTransactionById = async (ctx) => {
    ctx.body = await transactionService.getById(ctx.params.id);
};

const updateTransaction = async (ctx) => {
    ctx.body = await transactionService.updateById(ctx.params.id, {
        ...ctx.request.body,
        date: new Date(ctx.request.body.date),
    });
};

const deleteTransaction = async (ctx) => {
    await transactionService.deleteById(ctx.params.id);
    ctx.status = 204;
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {
    const router = new Router({
        prefix: '/transactions',
    });

    router.get('/', getAllTransactions);
    router.post('/', createTransaction);
    router.get('/:id', getTransactionById);
    router.put('/:id', updateTransaction);
    router.delete('/:id', deleteTransaction);

    app.use(router.routes()).use(router.allowedMethods());
};