const { tables } = require('..');

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.product, (table) => {
            table.uuid('id')
                .primary();

            table.string('name', 255)
                .notNullable();

            table.integer('price')
                .notNullable();

            table.unique('name', 'idx_product_name_unique');
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExists(tables.product);
    },
};