const transactionsRepository = require('../repository/transaction');

const getAll = async (
    limit = 100,
    offset = 0,
) => {
    const data = await transactionsRepository.findAll({ limit, offset });
    return {
        data,
        limit,
        offset
    };

};