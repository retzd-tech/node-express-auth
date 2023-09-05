const Admin = require("../models/admin");
const Constant = require("../api/Constant");

const passport = require("passport");
const jwt = require("jsonwebtoken");
const passportJWT = require("passport-jwt");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;

const jwtOpts = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
  // Telling Passport where to find the secret
  secretOrKey: "your_jwt_secret",
};

const useLocalStrategy = () => {
  
};

const useJWTStrategy = () => {
  
};

const signUp = async (req, res) => {
  if (!(req.body.email && req.body.password)) {
    return res.status(200).send("Insufficient information provided.");
  }

  Admin.findOne({ email: req.body.email }, async (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    } else {
      if (!result) {
        let newUser = new Admin({
          email: req.body.email,
          password: req.body.password,
        });
        Admin.createAdmin(newUser, (err, user) => {
          if (err) throw err;
          const token = jwt.sign({ id: Admin._id }, "your_jwt_secret");
          return res.status(200).send({
            success: true,
            isLoggedIn: true,
            token: token,
            message: "Logged In",
            user: user,
          });
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "This email has already been registered.",
        });
      }
    }
  });
};

const login = (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log(info);
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
      const token = jwt.sign({ id: user._id }, "your_jwt_secret");
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
  passport.authenticate(
    "jwt",
    {
      successRedirect: "",
      failureRedirect: "",
      session: false,
    },
    function (err, user, info) {
      if (err) {
        return res.send(null);
      }
      console.log(info);
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

useLocalStrategy();
useJWTStrategy();

module.exports = {
  login,
  authenticate,
  signUp,
  getAdminIdByEmail
};
