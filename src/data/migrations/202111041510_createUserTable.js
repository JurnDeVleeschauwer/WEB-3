const { tables } = require('..');

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.user, (table) => {
            table.uuid('id')
                .primary();

            table.string('name', 255)
                .notNullable();
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExists(tables.user);
    },
};