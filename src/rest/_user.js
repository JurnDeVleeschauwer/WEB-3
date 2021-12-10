const Router = require('@koa/router');
const userService = require('../service/user');
const Role = require('../core/roles');
const { requireAuthentication, makeRequireRole } = require('../core/auth');

const login = async (ctx) => {
    const { email, password } = ctx.request.body;
    const session = await userService.login(email, password);
    ctx.body = session;
};

const register = async (ctx) => {
    const session = await userService.register(ctx.request.body);
    ctx.body = session;
    ctx.status = 200;
};

const getAllUsers = async (ctx) => {
    const users = await userService.getAll(
        ctx.query.limit && Number(ctx.query.limit),
        ctx.query.offset && Number(ctx.query.offset)
    );
    ctx.body = users;
};

const getUserById = async (ctx) => {
    const user = await userService.getById(ctx.params.id);
    ctx.body = user;
};

const updateUserById = async (ctx) => {
    const user = await userService.updateById(ctx.params.id, ctx.request.body);
    ctx.body = user;
};

const deleteUserById = async (ctx) => {
    await userService.deleteById(ctx.params.id);
    ctx.status = 204;
};

/**
 * Install user routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = function installUsersRoutes(app) {
    const router = new Router({
        prefix: '/users',
    });

    // Public routes
    router.post('/login', login);
    router.post('/register', register);

    const requireAdmin = makeRequireRole(Role.ADMIN);

    // Routes with authentication/autorisation
    router.get('/', requireAuthentication, requireAdmin, getAllUsers);
    router.get('/:id', requireAuthentication, getUserById);
    router.put('/:id', requireAuthentication, updateUserById);
    router.delete('/:id', requireAuthentication, deleteUserById);

    app.use(router.routes()).use(router.allowedMethods());
};