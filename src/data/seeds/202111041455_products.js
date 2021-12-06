const { tables } = require('..');

module.exports = {
    seed: async (knex) => {
        // first delete all entries
        await knex(tables.product).delete();

        // then add the fresh products
        await knex(tables.product).insert([
            { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff83', name: 'Asperge', price: 5 },
            { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff84', name: 'Appel', price: 3 },
            { id: '7f28c5f9-d711-4cd6-ac15-d13d71abff85', name: 'Tomaat', price: 4 },
        ]);
    },
};