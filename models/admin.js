const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: false,
    default: ""
  },
  comment: {
    type: String,
    required: false,
    default: ""
  },
});

const User = (module.exports = mongoose.model("Admin", AdminSchema));

module.exports.createAdmin = async (newUser, callback) => {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newUser.password, salt, function (err, hash) {
      newUser.password = hash;
      return newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function (username, callback) {
  var query = { user_id: username };
  User.findOne(query, callback);
};

module.exports.getAdminById = function (id, callback) {
  User.findById(id, callback);
};

module.exports.comparePassword = function (
  candidatePassword,
  password,
  callback
) {
  bcrypt.compare(candidatePassword, password, function (err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
