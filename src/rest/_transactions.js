const Router = require('@koa/router');
const transactionService = require('../service/transaction');
const { requireAuthentication } = require('../core/auth');
const Joi = require('joi');
const validate = require('./_validation.js');



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
 *     summary: Get all transactions
 *     tags:
 *     - Transactions
 *     parameters:
 *           - $ref: "#/components/parameters/limitParam"
 *           - $ref: "#/components/parameters/offsetParam" 
 *     responses:
 *       200:
 *         description: List of transactions
 */
const getAllTransactions = async (ctx) => {
    const limit = ctx.query.limit && Number(ctx.query.limit);
    const offset = ctx.query.offset && Number(ctx.query.offset);
    ctx.body = await transactionService.getAll(limit, offset);
};
getAllTransactions.validationScheme = {
    query: Joi.object({
        limit: Joi.number().integer().positive().max(1000).optional(),
        offset: Joi.number().min(0).optional(),
    }).and('limit', 'offset'),
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
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - amount
 *                        - date
 *                        - productId
 *                   properties:
 *                        amount:
 *                            type: integer
 *                            format: int64
 *                        date:
 *                            type: string
 *                        productId:
 *                            type: string
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
        userId: ctx.state.session.userId,
        date: new Date(ctx.request.body.date),
    });
    ctx.body = newTransaction;
    ctx.status = 201;
};
createTransaction.validationScheme = {
    body: {
        amount: Joi.number().invalid(0),
        date: Joi.date().iso().less('now'),
        productId: Joi.string().uuid(),
    },
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Find transaction by ID
 *     description: Get a transaction with specifiek id
 *     tags:
 *      - Transactions
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of transaction to return"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       200:
 *         description: Find transaction by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 */
const getTransactionById = async (ctx) => {
    ctx.body = await transactionService.getById(ctx.params.id);
};
getTransactionById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Updates a specifiek transaction
 *     description: Updates a specifiek transaction
 *     tags:
 *      - Transactions
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of transaction to update"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - amount
 *                        - date
 *                        - productId
 *                   properties:
 *                        amount:
 *                            type: integer
 *                            format: int64
 *                        date:
 *                            type: string
 *                        productId:
 *                            type: string
 *     responses:
 *       200:
 *         description: Update transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 */
const updateTransaction = async (ctx) => {
    ctx.body = await transactionService.updateById(ctx.params.id, {
        ...ctx.request.body,
        userId: ctx.state.session.userId,
        date: new Date(ctx.request.body.date),
    });
};
updateTransaction.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
    body: {
        amount: Joi.number().invalid(0),
        date: Joi.date().iso().less('now'),
        productId: Joi.string().uuid(),
    },
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction by ID
 *     description: Delete a transaction with specifiek id
 *     tags:
 *      - Transactions
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of transaction to delete"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       204:
 *         description: Find transaction by ID and delete it
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Transaction"
 */
const deleteTransaction = async (ctx) => {
    await transactionService.deleteById(ctx.params.id);
    ctx.status = 204;
};
deleteTransaction.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
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

    router.get('/', requireAuthentication, validate(getAllTransactions.validationScheme), getAllTransactions);
    router.post('/', requireAuthentication, validate(createTransaction.validationScheme), createTransaction);
    router.get('/:id', requireAuthentication, validate(getTransactionById.validationScheme), getTransactionById);
    router.put('/:id', requireAuthentication, validate(updateTransaction.validationScheme), updateTransaction);
    router.delete('/:id', requireAuthentication, validate(deleteTransaction.validationScheme), deleteTransaction);

    app.use(router.routes()).use(router.allowedMethods());
};