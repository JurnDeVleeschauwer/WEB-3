const uuid = require('uuid');
const { tables, getKnex } = require('../data/index');
const { getChildLogger } = require('../core/logging');

/**
 * Find all `limit` products, skip the first `offset`.
 *
 * @param {object} pagination - Pagination options
 * @param {number} pagination.limit - Nr of products to return.
 * @param {number} pagination.offset - Nr of products to skip.
 */
const findAll = ({
    limit,
    offset,
}) => {
    return getKnex()(tables.product)
        .select()
        .limit(limit)
        .offset(offset)
        .orderBy('name', 'ASC');
};

/**
 * Find a product with the given `name`.
 *
 * @param {string} name - Name to look for.
 */
const findByName = (name) => {
    return getKnex()(tables.product)
        .where('name', name)
        .first();
};

/**
 * Find a product with the given `id`.
 *
 * @param {string} id - Id of the product to find.
 */
const findById = (id) => {
    return getKnex()(tables.product)
        .where('id', id)
        .first();
};

/**
 * Calculate the total number of products.
 */
const findCount = async () => {
    const [count] = await getKnex()(tables.product)
        .count();
    return count['count(*)'];
};

/**
 * Create a new product with the given `name` and `price`.
 *
 * @param {object} product - product to create.
 * @param {string} product.name - Name of the product.
 * @param {number} [product.price] - Price of the product.
 *
 * @returns {Promise<string>} Created product's id
 */
const create = async ({
    name,
    price,
}) => {
    try {
        const id = uuid.v4();
        await getKnex()(tables.product)
            .insert({
                id,
                name,
                price,
            });

        return await findById(id);
    } catch (error) {
        const logger = getChildLogger('products-repo');
        logger.error('Error in create', {
            error,
        });
        throw error;
    }
};

/**
 * Update an existing product with the given `name` and `price`.
 *
 * @param {string} id - Id of the product to update.
 * @param {object} product - product to create.
 * @param {string} [product.name] - Name of the product.
 * @param {number} [product.price] - Price of the product.
 *
 * @returns {Promise<string>} product's id
 */
const updateById = async (id, {
    name,
    price,
}) => {
    try {
        await getKnex()(tables.product)
            .update({
                name,
                price,
            })
            .where('id', id);

        return await findById(id);
    } catch (error) {
        const logger = getChildLogger('products-repo');
        logger.error('Error in updateById', {
            error,
        });
        throw error;
    }
};

/**
 * Delete a product.
 *
 * @param {string} id - Id of the product to delete.
 *
 * @returns {Promise<boolean>} Whether the product was deleted.
 */
const deleteById = async (id) => {
    try {
        const rowsAffected = await getKnex()(tables.product)
            .delete()
            .where('id', id);

        return rowsAffected > 0;
    } catch (error) {
        const logger = getChildLogger('products-repo');
        logger.error('Error in deleteById', {
            error,
        });
        throw error;
    }
};

module.exports = {
    findAll,
    findById,
    findCount,
    findByName,
    create,
    updateById,
    deleteById,
};
