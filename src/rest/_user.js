const Joi = require('joi');
const Router = require('@koa/router');
const userService = require('../service/user');
const Role = require('../core/roles');
const { requireAuthentication, makeRequireRole } = require('../core/auth');
const validate = require('./_validation');

const login = async (ctx) => {
    const { email, password } = ctx.request.body;
    const session = await userService.login(email, password);
    ctx.body = session;
};
login.validationScheme = {
    body: {
        email: Joi.string().email(),
        password: Joi.string(),
    },
};

const register = async (ctx) => {
    const session = await userService.register(ctx.request.body);
    ctx.body = session;
};
register.validationScheme = {
    body: {
        name: Joi.string().max(255),
        email: Joi.string().email(),
        password: Joi.string().min(8).max(30),
    },
};

const getAllUsers = async (ctx) => {
    const users = await userService.getAll(
        ctx.query.limit && Number(ctx.query.limit),
        ctx.query.offset && Number(ctx.query.offset),
    );
    ctx.body = users;
};
getAllUsers.validationScheme = {
    query: Joi.object({
        limit: Joi.number().positive().max(1000).optional(),
        offset: Joi.number().min(0).optional(),
    }).and('limit', 'offset'),
};

const getUserById = async (ctx) => {
    const user = await userService.getById(ctx.params.id);
    ctx.body = user;
};
getUserById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

const updateUserById = async (ctx) => {
    const user = await userService.updateById(ctx.params.id, ctx.request.body);
    ctx.body = user;
};
updateUserById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
    body: {
        name: Joi.string().max(255),
        email: Joi.string().email(),
    },
};

const deleteUserById = async (ctx) => {
    await userService.deleteById(ctx.params.id);
    ctx.status = 204;
};
deleteUserById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
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
    router.post('/login', validate(login.validationScheme), login);
    router.post('/register', validate(register.validationScheme), register);

    const requireAdmin = makeRequireRole(Role.ADMIN);

    // Routes with authentication/autorisation
    router.get('/', requireAuthentication, requireAdmin, validate(getAllUsers.validationScheme), getAllUsers);
    router.get('/:id', requireAuthentication, validate(getUserById.validationScheme), getUserById);
    router.put('/:id', requireAuthentication, validate(updateUserById.validationScheme), updateUserById);
    router.delete('/:id', requireAuthentication, validate(deleteUserById.validationScheme), deleteUserById);

    app
        .use(router.routes())
        .use(router.allowedMethods());
};