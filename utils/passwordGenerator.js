const crypto = require('crypto');

function generatePassword(string) {
  const randomStr = string === '' || string === undefined || string === null ? generateRandomAlphaNumeric(8) : string;
  const hash = crypto.createHash('sha256').update(randomStr).digest('hex');
  return hash.substring(0, 256);
}

function validatePassword(input, hashedPassword, length = 256) {
  const inputHash = crypto.createHash('sha256').update(input).digest('hex').substring(0, length);
  return inputHash === hashedPassword;
}

// Export both functions
module.exports = {
  generatePassword,
  validatePassword,
};