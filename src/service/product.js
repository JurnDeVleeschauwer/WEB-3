const config = require('config');
const { getChildLogger } = require('../core/logging');
const productRepository = require('../repository/product');

const DEFAULT_PAGINATION_LIMIT = config.get('pagination.limit');
const DEFAULT_PAGINATION_OFFSET = config.get('pagination.offset');

const debugLog = (message, meta = {}) => {
    if (!this.logger) this.logger = getChildLogger('product-service');
    this.logger.debug(message, meta);
};

/**
 * Get all `limit` products, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of products to fetch.
 * @param {number} [offset] - Nr of products to skip.
 */
const getAll = async (
    limit = DEFAULT_PAGINATION_LIMIT,
    offset = DEFAULT_PAGINATION_OFFSET,
) => {
    debugLog('Fetching all products', { limit, offset });
    const data = await productRepository.findAll({ limit, offset });
    const count = await productRepository.findCount();
    return { data, count, limit, offset };
};

/**
 * Get the product with the given `id`.
 *
 * @param {string} id - Id of the product to get.
 */
const getById = (id) => {
    debugLog(`Fetching product with id ${id}`);
    return productRepository.findById(id);
};

/**
 * Create a new product.
 *
 * @param {object} product - product to create.
 * @param {string} product.name - Name of the product.
 * @param {number} [product.price] - price of the product (between 1 and 5).
 */
const create = ({ name, price }) => {
    const newproduct = { name, price };
    debugLog('Creating new product', newproduct);
    return productRepository.create(newproduct);
};

/**
 * Update an existing product.
 *
 * @param {string} id - Id of the product to update.
 * @param {object} product - product to save.
 * @param {string} [product.name] - Name of the product.
 * @param {number} [product.price] - price of the product (between 1 and 5).
 */
const updateById = (id, { name, price }) => {
    const updatedproduct = { name, price };
    debugLog(`Updating product with id ${id}`, updatedproduct);
    return productRepository.updateById(id, updatedproduct);
};

/**
 * Delete an existing product.
 *
 * @param {string} id - Id of the product to delete.
 */
const deleteById = async (id) => {
    debugLog(`Deleting product with id ${id}`);
    await productRepository.deleteById(id);
};

module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
};