const Router = require('@koa/router');
const productService = require('../service/product');
const { requireAuthentication } = require('../core/auth');
const Joi = require('joi');
const validate = require('./_validation.js');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Represents a product that is available
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *     - Products
 *     parameters:
 *           - $ref: "#/components/parameters/limitParam"
 *           - $ref: "#/components/parameters/offsetParam" 
 *     responses:
 *       200:
 *         description: List of products
 */
const getAllProducts = async (ctx) => {
    ctx.body = await productService.getAll();
};
getAllProducts.validationScheme = {
    query: Joi.object({
        limit: Joi.number().positive().max(1000).optional(),
        offset: Joi.number().min(0).optional(),
    }).and('limit', 'offset'),
};


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product
 *     tags:
 *      - Products
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - name
 *                        - price
 *                   properties:
 *                        name:
 *                            type: string                            
 *                        price:
 *                            type: integer
 *                            format: int64
 *     responses:
 *       200:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
const createProduct = async (ctx) => {
    const newproduct = await productService.create(ctx.request.body);
    ctx.body = newproduct;
    ctx.status = 201;
};
createProduct.validationScheme = {
    body: {
        name: Joi.string().max(255),
        price: Joi.number().min(1).integer(),
    },
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Find product by ID
 *     description: Get a product with specifiek id
 *     tags:
 *      - Products
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of product to return"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       200:
 *         description: Find product by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
const getProductById = async (ctx) => {
    ctx.body = await productService.getById(ctx.params.id);
};
getProductById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Updates a specifiek product
 *     description: Updates a specifiek product
 *     tags:
 *      - Products
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of product to update"
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
 *                        - name
 *                        - price
 *                   properties:
 *                        name:
 *                            type: string                            
 *                        price:
 *                            type: integer
 *                            format: int64
 *     responses:
 *       200:
 *         description: Update product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
const updateProduct = async (ctx) => {
    ctx.body = await productService.updateById(ctx.params.id, ctx.request.body);
};
updateProduct.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
    body: {
        name: Joi.string().max(255),
        price: Joi.number().min(1).integer(),
    },
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     description: Delete a product with specifiek id
 *     tags:
 *      - Products
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of product to delete"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       204:
 *         description: Find product by ID and delete it
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 */
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