module.exports = {
	log: {
		level: 'info',
		disabled: false,
	},
	cors: {
		origins: [`Server listening on http://localhost:9000/`],
		maxAge: 3 * 60 * 60, // 3h in seconds
	},
	database: {
		client: 'mysql2',
		host: 'localhost',
		port: 3306,
		name: 'webshop',
		username: 'root',
		password: 'root',
	},
	pagination: {
		limit: 100,
		offset: 0,
	},
};