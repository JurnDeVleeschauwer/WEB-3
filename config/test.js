module.exports = {
    log: {
        level: 'silly',
        disabled: true,
    },
    cors: {
        origins: [`Server listening on http://localhost:9000/`],
        maxAge: 3 * 60 * 60, // 3h in seconds
    },
    database: {
        client: 'mysql2',
        host: 'localhost',
        port: 3306,
        name: 'shop_test',
        username: 'root',
        password: 'root',
    },
    pagination: {
        limit: 100,
        offset: 0,
    },
};