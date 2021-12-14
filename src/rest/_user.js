const Joi = require('joi');
const Router = require('@koa/router');
const userService = require('../service/user');
const Role = require('../core/roles');
const { requireAuthentication, makeRequireRole } = require('../core/auth');
const validate = require('./_validation');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Represents a users that is available
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     description: Login user
 *     tags:
 *      - Users
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - email
 *                        - password
 *                   properties:
 *                        email:
 *                            type: string                            
 *                        password:
 *                            type: string
 *     responses:
 *       204:
 *         description: Login user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
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

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register user
 *     description: Register user
 *     tags:
 *      - Users
  *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - name
 *                        - email
 *                        - password
 *                   properties:
 *                        name:
 *                            type: string
 *                        email:
 *                            type: string                            
 *                        password:
 *                            type: string
 *     responses:
 *       204:
 *         description: Register user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
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


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *     - Users
 *     parameters:
 *           - $ref: "#/components/parameters/limitParam"
 *           - $ref: "#/components/parameters/offsetParam" 
 *     responses:
 *       200:
 *         description: List of users
 */
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

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Find user by ID
 *     description: Get a user with specifiek id
 *     tags:
 *      - Users
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of user to return"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       200:
 *         description: Find user by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
const getUserById = async (ctx) => {
    const user = await userService.getById(ctx.params.id);
    ctx.body = user;
};
getUserById.validationScheme = {
    params: {
        id: Joi.string().uuid(),
    },
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Updates a specifiek user
 *     description: Updates a specifiek user
 *     tags:
 *      - Users
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of user to update"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     requestBody:
 *        required: true
 *        content:
 *           application/json:
 *                schema:
 *                   type: object
 *                   required:
 *                        - name
 *                   properties:
 *                        name:
 *                            type: string                             
 *     responses:
 *       200:
 *         description: Update user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
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
    },
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a user with specifiek id
 *     tags:
 *      - Users
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "ID of user to delete"
 *        required: true
 *        type: "integer"
 *        format: "int64"
 *     responses:
 *       204:
 *         description: Find user by ID and delete it
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
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