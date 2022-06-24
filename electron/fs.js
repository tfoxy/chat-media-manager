const {
  constants: { F_OK },
} = require("fs");
const { access } = require("fs/promises");

/**
 * @param {unknown} error
 * @returns {error is Error}
 */
function isEnoent(error) {
  return error instanceof Error && error.code === "ENOENT";
}

/**
 * @param {string} filePath
 */
async function exists(filePath) {
  try {
    await access(filePath, F_OK);
    return true;
  } catch (error) {
    if (!isEnoent(error)) {
      throw error;
    }
    return false;
  }
}

module.exports = { isEnoent, exists };
