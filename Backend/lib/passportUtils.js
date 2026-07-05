const bcrypt = require("bcrypt");

// Function to verify a plain text password against a stored hash
function validPassword(plainPassword, storedHash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, storedHash, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function genPassword(plainPassword, saltRounds = 10) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return reject(err);
      bcrypt.hash(plainPassword, salt, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
}

module.exports = { validPassword, genPassword };
