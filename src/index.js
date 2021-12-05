const config = require("config");
const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const { initializeLogger, getLogger } = require("./core/logging");
const koaCors = require("@koa/cors");
const { initializeData } = require("./data");

const PORT = config.get("port");
const HOST = config.get("host");
const CORS_ORIGINS = config.get("cors.origins");
const CORS_MAX_AGE = config.get("cors.maxAge");
const NODE_ENV = config.get("env");
const LOG_LEVEL = config.get("log.level");
const LOG_DISABLED = config.get("log.disabled");

initializeLogger({
	level: LOG_LEVEL,
	disabled: LOG_DISABLED,
	isProduction: NODE_ENV === 'production',
	defaultMeta: { NODE_ENV },
});


const app = new Koa();
const logger = getLogger();

console.log(`log level ${LOG_LEVEL}, logs enabled: ${LOG_DISABLED !== true}`);

async function main() {
	app.use(
		koaCors({
			origin: (ctx) => {
				if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
					return ctx.request.header.origin;
				}
				// Not a valid domain at this point, let's return the first valid as we should return a string
				return CORS_ORIGINS[0];
			},
			allowHeaders: ["Accept", "Content-Type", "Authorization"],
			maxAge: CORS_MAX_AGE,
		})
	);

	app.use(bodyParser());

	await initializeData();

	app.use(async (ctx, next) => {
		ctx.body = "Hello World!!";
		await next();
	});

	app.use(async (ctx, next) => {
		logger.info(JSON.stringify(ctx.request));
		ctx.body = "Goodbye";
		next();
	});
}
//app.use(async (ctx, next) => {
//	console.log(ctx);
//	await next();
//});
main();

const router = new Router();
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT);
logger.info(`Server listening on http://${HOST}:${PORT}/`);
