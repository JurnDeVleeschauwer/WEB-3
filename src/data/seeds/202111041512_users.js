const { tables } = require('..');

module.exports = {
    seed: async (knex) => {
        // first delete all entries
        await knex(tables.user).delete();

        // then add the fresh users (all passwords are 12345678)
        await knex(tables.user).insert([
            {
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
                name: 'Thomas Aelbrecht',
            },
            {
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff81',
                name: 'Pieter Van Der Helst',
            },
            {
                id: '7f28c5f9-d711-4cd6-ac15-d13d71abff82',
                name: 'Karine Samyn',
            },
        ]);
    },
};