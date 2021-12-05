const productService = require('../service/product');

const getAllProduct = async (ctx) => {
    ctx.body = await getAll();
};