const productsRepository = require('../repository/product');

const getAll = async (
    limit = 100,
    offset = 0,
) => {
    const data = await productsRepository.findAll({ limit, offset });
    return {
        data,
        limit,
        offset
    };

};