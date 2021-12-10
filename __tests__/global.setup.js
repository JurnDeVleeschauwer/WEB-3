const config = require('config');
const { initializeData, getKnex, tables } = require('../src/data');
const { initializeLogger } = require('../src/core/logging');
const Role = require('../src/core/roles');

module.exports = async () => {
    // Create a database connection
    initializeLogger({
        level: config.get('log.level'),
        disabled: config.get('log.disabled'),
    });
    await initializeData();

    const knex = getKnex();

    // Insert test users with password 12345678
    await knex(tables.user).insert([{
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abff80',
        name: 'Test User',
        email: 'test.user@hogent.be',
        password_hash:
            '$argon2id$v=19$m=2048,t=2,p=1$NF6PFLTgSYpDSex0iFeFQQ$Rz5ouoM9q3EH40hrq67BC3Ajsu/ohaHnkKBLunELLzU',
        roles: JSON.stringify([Role.USER]),
    },
    {
        id: '7f28c5f9-d711-4cd6-ac15-d13d71abffaa',
        name: 'Admin User',
        email: 'admin.user@hogent.be',
        password_hash:
            '$argon2id$v=19$m=2048,t=2,p=1$NF6PFLTgSYpDSex0iFeFQQ$Rz5ouoM9q3EH40hrq67BC3Ajsu/ohaHnkKBLunELLzU',
        roles: JSON.stringify([Role.ADMIN, Role.USER]),
    }]);
};