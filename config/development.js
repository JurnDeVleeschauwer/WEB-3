const PORT = config.get('port')
const HOST = config.get('host')
module.exports = {
	log: {
		level: 'silly',
		disabled: false,
	},
	cors: {
		origins: [`Server listening on http://${HOST}:${PORT}/`],
		maxAge: 3 * 60 * 60,
	},
	database: {
    client: 'mysql',
    host: 'localhost',
    port: 3306,
    name: 'shop',
  },
	pagination: {
    limit: 100,
    offset: 0,
  },
};