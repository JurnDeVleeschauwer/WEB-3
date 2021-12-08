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