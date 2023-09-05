const Admin = require("../models/admin");
const Constant = require("../api/Constant");

const passport = require("passport");
const jwt = require("jsonwebtoken");
const base64 = require("base-64");

const signUp = async (req, res) => {
  const { user_id, password, nickname, comment } = req.body;
  if (!(user_id && password)) {
    const response = {
      message: "Account creation failed",
      cause: "required user_id and password",
    };
    return res.status(400).send(response);
  }
  const isValidCharacters = /^[a-zA-Z0-9]+$/i.test(user_id);
  const isValidUserIdLength = user_id.length > 5 && user_id.length < 21;
  const isValidUserId = isValidUserIdLength && isValidCharacters;
  const isValidPasswordLength = password.length > 7 && user_id.length < 21;
  const isValidPasswordCharacters =
    /^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\]^_`{|}~-]*$/i.test(password);

  const isValidPassword = isValidPasswordLength && isValidPasswordCharacters;

  if (!(isValidUserId && isValidPassword)) {
    const response = {
      message: "Account creation failed",
      cause: "required user_id and password",
    };
    return res.status(400).send(response);
  }

  // return res.status(200).send({ user_id: validRegex, password: ASCII });

  Admin.findOne({ user_id }, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    } else {
      if (!result) {
        let newUser = new Admin({
          user_id,
          password,
          nickname,
          comment,
        });
        Admin.createAdmin(newUser, (err, user) => {
          if (err) throw err;
          const response = {
            message: "Account successfully created",
            user: {
              user_id,
              nickname,
              comment,
            },
          };
          return res.status(200).send(response);
        });
      } else {
        const response = {
          message: "Account creation failed",
          cause: "already same user_id is used",
        };
        return res.status(400).send(response);
      }
    }
  });
};

const login = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user,
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
        expiresIn: "5m",
      });
      return res.status(200).send({
        isLoggedIn: true,
        token: token,
        message: "Logged In",
        user: user,
      });
    });
  })(req, res);
};

const getAdminIdByEmail = (req, res) => {
  Admin.findOne({ email: req.body.email }, async (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    return res.status(200).send({
      success: false,
      message: result,
    });
  });
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  const jwtstatus = jwt.verify(token, "your_jwt_secret");
  passport.authenticate(
    "jwt",
    {
      successRedirect: "",
      failureRedirect: "",
      session: true,
    },
    function (err, user, info) {
      if (err) {
        return res.send(null);
      }
      if (info.message !== Constant.USER_DETECTED) {
        return res.send({ isLoggedIn: false });
      } else {
        return res.status(200).send({
          isLoggedIn: true,
          message: "Logged In",
          user: user,
        });
      }
    }
  )(req, res, next);
};

const authenticateCredentials = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) {
      const response = {
        message: "Authentication Failed",
      };
      return res.status(401).json(response);
    }
    next();
  })(req, res);
};

const decodeAuthorizationPayload = (req) => {
  const {
    headers: { authorization },
  } = req;
  const decodedAuthorization = Buffer.from(authorization, "base64").toString(
    "utf-8"
  );
  const decoded_user_id = decodedAuthorization.split(":")[0];
  const decoded_password = decodedAuthorization.split(":")[1];

  return { decoded_user_id, decoded_password };
};

const getUserById = (req, res) => {
  const {
    params: { user_id: requested_user_id },
  } = req;
  const { decoded_user_id, decoded_password } = decodeAuthorizationPayload(req);
  req.body.user_id = decoded_user_id;
  req.body.password = decoded_password;
  const callbackFunction = () => getUserByIdAction(res, requested_user_id);
  authenticateCredentials(req, res, callbackFunction);
};

const updateUserById = (req, res) => {
  const {
    params: { user_id: requested_user_id },
  } = req;
  const { nickname, comment } = req.body;
  if (!nickname && !comment) {
    const response = {
      message: "User updation failed",
      cause: "required nickname or comment",
    };
    return res.status(400).send(response);
  }
  const payload = {
    nickname,
    comment,
  };
  const { decoded_user_id, decoded_password } = decodeAuthorizationPayload(req);
  if (requested_user_id !== decoded_user_id) {
    const response = {
      message: "No Permission for Update",
    };
    return res.status(403).send(response);
  }
  req.body.user_id = decoded_user_id;
  req.body.password = decoded_password;
  const callbackFunction = () =>
    updateUserByIdAction(res, requested_user_id, payload);
  authenticateCredentials(req, res, callbackFunction);
};

const getUserByIdAction = (res, requested_user_id) => {
  Admin.findOne({ user_id: requested_user_id }, (err, user) => {
    const { user_id, nickname, comment } = user;
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!user) {
      const response = {
        message: "No User found",
      };
      return res.status(404).send(response);
    }
    const response = {
      message: "User details by user_id",
      user: {
        user_id,
        nickname,
        comment,
      },
    };
    return res.status(200).send(response);
  });
};

const deleteUserById = (req, res) => {
  const {
    body: { user_id: requested_user_id },
  } = req;
  const { decoded_user_id, decoded_password } = decodeAuthorizationPayload(req);
  if (requested_user_id !== decoded_user_id) {
    const response = {
      message: "No Permission for Delete",
    };
    return res.status(403).send(response);
  }
  req.body.user_id = decoded_user_id;
  req.body.password = decoded_password;
  const callbackFunction = () => deleteUserByIdAction(res, requested_user_id);
  authenticateCredentials(req, res, callbackFunction);
};

const updateUserByIdAction = (res, requested_user_id, payload) => {
  const { nickname, comment } = payload;
  Admin.updateOne(
    { user_id: requested_user_id },
    {
      $set: {
        nickname,
        comment,
      },
    },
    (error) => {
      if (error) {
        const response = {
          message: "User updation failed",
          cause: "not updatable nickname and comment",
        };
        return res.status(500).json(response);
      }
      const response = {
        message: "User successfully updated",
        user: {
          nickname,
          comment,
        },
      };
      return res.status(200).json(response);
    }
  );
};

const deleteUserByIdAction = (res, requested_user_id) => {
  Admin.deleteOne({ user_id: requested_user_id }, (error) => {
    if (error) {
      const response = {
        message: "Failed removing Account and User",
      };
      return res.status(500).json(response);
    }
    const response = {
      message: "Account and User successfully removed",
    };
    return res.status(200).json(response);
  });
};

module.exports = {
  login,
  authenticate,
  signUp,
  getAdminIdByEmail,
  getUserById,
  updateUserById,
  deleteUserById,
};
