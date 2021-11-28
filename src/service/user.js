const { getChildLogger } = require('../core/logging');
const userRepository = require('../repository/user');

const debugLog = (message, meta = {}) => {
	if (!this.logger) this.logger = getChildLogger('user-service');
	this.logger.debug(message, meta);
};

/**
 * Register a new user
 *
 * @param {object} user - The user's data.
 * @param {string} user.name - The user's name.
 */
const register = ({
  name,
}) => {
  debugLog('Creating a new user', { name });
  return userRepository.create({
    name,
  });
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
    data,
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

  return user;
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
const updateById = (id, { name, email }) => {
  debugLog(`Updating user with id ${id}`, { name, email });
  return userRepository.updateById(id, { name, email });
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

module.exports = {
  register,
  getAll,
  getById,
  updateById,
  deleteById,
};