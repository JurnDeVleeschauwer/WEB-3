const Router = require('@koa/router');
const productService = require('../service/product');
const { requireAuthentication } = require('../core/auth');
const Joi = require('joi');
const validate = require('./_validation.js');

const getAllProducts = async (ctx) => {
    ctx.body = await productService.getAll();
};
getAllProducts.validationScheme = {
    query: Joi.object({
        limit: Joi.number().positive().max(1000).optional(),
        offset: Joi.number().min(0).optional(),
    }).and('limit', 'offset'),
};

const createProduct = async (ctx) => {
    const newproduct = await productService.create(ctx.request.body);
    ctx.body = newproduct;
    ctx.status = 201;
};
createProduct.validationScheme = {
    body: {
        name: Joi.string().max(255),
        price: Joi.number().min(1).max(5).integer().optional(),
    },
};


const getProductById = async (ctx) => {
    ctx.body = await productService.getById(ctx.params.id);
};
getProductById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

const updateProduct = async (ctx) => {
    ctx.body = await productService.updateById(ctx.params.id, ctx.request.body);
};
updateProduct.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
    body: {
        name: Joi.string().max(255),
        price: Joi.number().min(1).max(5).integer(),
    },
};

const deleteProduct = async (ctx) => {
    await productService.deleteById(ctx.params.id);
    ctx.status = 204;
};
deleteProduct.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

/**
 * Install products routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {
    const router = new Router({
        prefix: '/products',
    });

    router.get('/', requireAuthentication, validate(getAllProducts.validationScheme), getAllProducts);
    router.post('/', requireAuthentication, validate(createProduct.validationScheme), createProduct);
    router.get('/:id', requireAuthentication, validate(getProductById.validationScheme), getProductById);
    router.put('/:id', requireAuthentication, validate(updateProduct.validationScheme), updateProduct);
    router.delete('/:id', requireAuthentication, validate(deleteProduct.validationScheme), deleteProduct);

    app.use(router.routes()).use(router.allowedMethods());
};