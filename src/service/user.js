const { getChildLogger } = require('../core/logging');
const { verifyPassword, hashPassword } = require('../core/password');
const { generateJWT, verifyJWT } = require('../core/jwt');
const Role = require('../core/roles');
const userRepository = require('../repository/user');

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getChildLogger('user-service');
  this.logger.debug(message, meta);
};

/**
 * Only return the public information about the given user.
 */
const makeExposedUser = ({
  id,
  name,
  email,
  roles,
}) => ({
  id,
  name,
  email,
  roles,
});

/**
 * Create the returned information after login.
 */
const makeLoginData = async (user) => {
  const token = await generateJWT(user);

  return {
    user: makeExposedUser(user),
    token,
  };
};

/**
 * Try to login a user with the given username and password.
 *
 * @param {string} email - The email to try.
 * @param {string} password - The password to try.
 *
 * @returns {Promise<object>} - Promise whichs resolves in an object containing the token and signed in user.
 */
const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // DO NOT expose we don't know the user
    throw new Error('The given email and password do not match');
  }

  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    // DO NOT expose we know the user but an invalid password was given
    throw new Error('The given email and password do not match');
  }

  return await makeLoginData(user);
};

/**
 * Register a new user
 *
 * @param {object} user - The user's data.
 * @param {string} user.name - The user's name.
 */
const register = async ({
  name,
  email,
  password,
}) => {
  debugLog('Creating a new user', { name });
  const passwordHash = await hashPassword(password);

  const user = await userRepository.create({
    name,
    email,
    passwordHash,
    roles: [Role.USER],
  });

  return await makeLoginData(user);
};


/**
 * Get all `limit` users, skip the first `offset`.
 *
 * @param {number} [limit] - Nr of users to fetch.
 * @param {number} [offset] - Nr of users to skip.
 */
const getAll = async (
  limit = 100,
  offset = 0,
) => {
  debugLog('Fetching all users', { limit, offset });
  const data = await userRepository.findAll({ limit, offset });
  const totalCount = await userRepository.findCount();
  return {
    data: data.map(makeExposedUser),
    count: totalCount,
    limit,
    offset,
  };
};

/**
 * Get the user with the given id.
 *
 * @param {string} id - Id of the user to get.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 */
const getById = async (id) => {
  debugLog(`Fetching user with id ${id}`);
  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error(`No user with id ${id} exists`, { id });
  }

  return makeExposedUser(user);
};


/**
 * Update an existing user.
 *
 * @param {string} id - Id of the user to update.
 * @param {object} user - User to save.
 * @param {string} [user.name] - Name of the user.
 * @param {number} [user.email] - Email of the user.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 * - VALIDATION_FAILED: A user with the same email exists.
 */
const updateById = async (id, { name, email }) => {
  debugLog(`Updating user with id ${id}`, { name, email });
  const user = await userRepository.updateById(id, { name, email });
  return makeExposedUser(user);
};


/**
 * Delete an existing user.
 *
 * @param {string} id - Id of the user to delete.
 *
 * @throws {ServiceError} One of:
 * - NOT_FOUND: No user with the given id could be found.
 */
const deleteById = async (id) => {
  debugLog(`Deleting user with id ${id}`);
  const deleted = await userRepository.deleteById(id);

  if (!deleted) {
    throw new Error(`No user with id ${id} exists`, { id });
  }
};

/**
 * Check and parse a JWT from the given header into a valid session
 * if possible.
 *
 * @param {string} authHeader - The bare 'Authorization' header to parse
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Invalid JWT token provided, possible errors:
 *   - no token provided
 *   - incorrect 'Bearer' prefix
 *   - expired JWT
 *   - other unknown error
 */
const checkAndParseSession = async (authHeader) => {
  if (!authHeader) {
    throw new Error('You need to be signed in');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authentication token');
  }

  const authToken = authHeader.substr(7);
  try {
    const {
      roles, userId,
    } = await verifyJWT(authToken);

    return {
      userId,
      roles,
      authToken,
    };
  } catch (error) {
    const logger = getChildLogger('user-service');
    logger.error(error.message, { error });
    throw new Error(error.message);
  }
};

/**
 * Check if the given roles include the given required role.
 *
 * @param {string} role - Role to require.
 * @param {string[]} roles - Roles of the user.
 *
 * @returns {void} Only throws if role not included.
 *
 * @throws {ServiceError} One of:
 * - UNAUTHORIZED: Role not included in the array.
 */
const checkRole = (role, roles) => {
  const hasPermission = roles.includes(role);

  if (!hasPermission) {
    throw new Error('You are not allowed to view this part of the application');
  }
};

module.exports = {
  login,
  register,
  getAll,
  getById,
  updateById,
  deleteById,
  checkAndParseSession,
  checkRole,
};