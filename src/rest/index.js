const Router = require('@koa/router');
const installTransactionRouter = require('./_transactions');
const installHealthRouter = require('./_health');
const installProductRouter = require('./_products');
const installUserRouter = require('./_user');


/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
/**
 * @swagger
 * components:
 *   parameters:
 *     limitParam:
 *       in: query
 *       name: limit
 *       description: Maximum amount of items to return
 *       required: false
 *       schema:
 *         type: integer
 *         default: 100
 *     offsetParam:
 *       in: query
 *       name: offset
 *       description: Number of items to skip
 *       required: false
 *       schema:
 *         type: integer
 *         default: 0
  */

/**
 * @swagger
 * components:
 *   schemas:
 *     Base:
 *       required:
 *         - id
  *       properties:
 *         id:
 *           type: string
 *           format: "uuid"
 *       example:
 *         id: "6d560fca-e7f9-4583-af2d-b05ccd1a0c58"
 *     ListResponse:
 *       required:
 *         - count
 *         - limit
 *         - offset
 *       properties:
 *         count:
 *           type: integer
 *           description: Number of items returned
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Limit actually used
 *           example: 1
 *         offset:
 *           type: integer
 *           description: Offset actually used
 *           example: 1
 *     User:
 *       allOf:
 *         - $ref: "#/components/schemas/Base"
 *         - type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: "string"
 *             email:
 *               type: "string"
 *               format: email
 *           example:
 *             $ref: "#/components/examples/User"
 *   examples:
 *     User:
 *       id: "8f4153f6-939e-4dcf-9019-724999265f0d"
 *       name: "Thomas Aelbecht"
 *       email: "thomas.aelbrecht@hogent.be"
 */

/**
 * @swagger
 * components:
 *   responses:
 *     404NotFound:
 *       description: The request resource could not be found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - details
 *             properties:
 *               code:
 *                 type: string
 *               details:
 *                 type: string
 *                 description: Extra information about the specific not found error that occured
 *               stack:
 *                 type: string
 *                 description: Stack trace (only available if set in configuration)
 *             example:
 *               code: "NOT_FOUND"
 *               details: "No user with the id 99dada36-de4a-42ba-b329-3b1d88778c72 exists"
 */

module.exports = (app) => {

    const router = new Router({
        prefix: '/api',
    });


    installTransactionRouter(router);
    installProductRouter(router);
    installHealthRouter(router);
    installUserRouter(router);


    app.use(router.routes()).use(router.allowedMethods());
};