const { AdminService } = require("../services");
const Admin = require("../models/admin");

const Constant = require("../api/Constant");

const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = passportJWT.Strategy;

const express = require("express");
const router = express.Router();

const jwtOpts = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
  // Telling Passport where to find the secret
  secretOrKey: "your_jwt_secret",
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "user_id",
      passwordField: "password",
      session: false,
    },
    function (username, password, done) {
      Admin.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
          return done(null, false, { message: "Unknown User" });
        }
        const { password: currentPassword } = user;
        Admin.comparePassword(password, currentPassword, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        });
      });
    }
  )
);

passport.use(
  new JWTStrategy(jwtOpts, function (token, callback) {
    Admin.getAdminById(token.id, (err, user) => {
      if (err) {
        throw err;
      }
      if (!user) {
        return callback(null, false, { message: Constant.USER_NOT_DETECTED });
      }
      console.log(user);
      return callback(null, user, { message: Constant.USER_DETECTED });
    });
  })
);

router.post("/login", (req, res) => {
  AdminService.login(req, res);
});

router.get("/logout", function (req, res) {
  req.logout();
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

router.post("/get-admin-id", function (req, res) {
  AdminService.getAdminIdByEmail(req, res);
});

router.post("/signup", function (req, res) {
  AdminService.signUp(req, res);
});

router.get("/users/:user_id", function (req, res) {
  AdminService.getUserById(req, res);
});

router.patch("/users/:user_id", function (req, res) {
  AdminService.updateUserById(req, res);
});

router.post("/close", function (req, res) {
  AdminService.deleteUserById(req, res);
});

router.post("/isloggedin", function (req, res, next) {
  AdminService.authenticate(req, res, next);
});

router.get("/hello", function (req, res, next) {
  // if (
  //   req.headers.authorization.includes("undefined") ||
  //   req.headers.authorization.includes("null")
  // ) {
  //   return res.send();
  // }
  res.send("Hello!");
});

module.exports = router;