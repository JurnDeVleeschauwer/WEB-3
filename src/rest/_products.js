const Router = require('@koa/router');
const productService = require('../service/product');

const getAllproducts = async (ctx) => {
    ctx.body = await productService.getAll();
};

const createproduct = async (ctx) => {
    const newproduct = await productService.create(ctx.request.body);
    ctx.body = newproduct;
    ctx.status = 201;
};

const getproductById = async (ctx) => {
    ctx.body = await productService.getById(ctx.params.id);
};

const updateproduct = async (ctx) => {
    ctx.body = await productService.updateById(ctx.params.id, ctx.request.body);
};

const deleteproduct = async (ctx) => {
    await productService.deleteById(ctx.params.id);
    ctx.status = 204;
};

/**
 * Install transaction routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {
    const router = new Router({
        prefix: '/products',
    });

    router.get('/', getAllproducts);
    router.post('/', createproduct);
    router.get('/:id', getproductById);
    router.put('/:id', updateproduct);
    router.delete('/:id', deleteproduct);

    app.use(router.routes()).use(router.allowedMethods());
};