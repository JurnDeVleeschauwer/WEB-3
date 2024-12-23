const { tables } = require('..');

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.transaction, (table) => {
            table.uuid('id')
                .primary();

            table.integer('amount')
                .notNullable();

            table.dateTime('date')
                .notNullable();

            table.uuid('user_id')
                .notNullable();

            // Give this foreign key a name for better error handling in service layer
            table.foreign('user_id', 'fk_transaction_user')
                .references(`${tables.user}.id`)
                .onDelete('CASCADE');

            table.uuid('product_id')
                .notNullable();

            // Give this foreign key a name for better error handling in service layer
            table.foreign('product_id', 'fk_transaction_product')
                .references(`${tables.product}.id`)
                .onDelete('CASCADE');
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExists(tables.transaction);
    },
};