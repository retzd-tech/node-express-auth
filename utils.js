const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config();

const getWebsiteUrl = () => {
  typeof process.env.NODE_ENV !== "undefined" &&
    process.env.NODE_ENV !== "development";
  return process.env.HOSTNAME;
};

const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

const generateRandomPassword = () => {
  const password = crypto.randomBytes(6).toString("hex");
  return password;
};

module.exports = {
  getWebsiteUrl,
  generatePasswordResetToken,
  generateRandomPassword,
};
