/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports.authenticateUser = function(User) {
  return function(req, res, next) {
    User.getUserByEmail(res.locals.email, function(err, user) {
      if (err) {
        return res.json({
          "error": "Login database error",
          "login_error": err instanceof Error ? err.toString() : err
        });
      }

      if (!user) {
        return res.json({
          "email": res.locals.email
        });
      }

      res.locals.user = user;
      process.nextTick(next);
    });
  };
};

module.exports.createUser = function(User) {
  return function(req, res, next) {
    if (req.body.user && !req.body.user.username) {
      return res.json({
        "error": "Missing username"
      });
    }

    var userInfo = {
      email: res.locals.email,
      mailingList: !!req.body.user.mailingList,
      username: req.body.user.username,
      prefLocale: req.body.user.prefLocale,
      referrer: req.body.user.referrer
    };

    User.createUser(userInfo, function(err, user) {
      if (err) {
        return res.json({
          "error": "Login database error",
          "login_error": err instanceof Error ? err.toString() : err
        });
      }

      if (!user) {
        return res.json({
          "error": "Login database error",
          "login_error": "Failed to create user"
        });
      }

      res.locals.user = user;
      process.nextTick(next);
    });
  };
};

module.exports.exists = function(User) {
  return function(req, res, next) {
    if (!req.body.username) {
      return res.json({
        "error": "Missing username"
      });
    }

    User.getUserByUsername(req.body.username, function(err, user) {
      if (err) {
        return res.json({
          "error": "Login database error",
          "login_error": err instanceof Error ? err.toString() : err
        });
      }

      res.json({
        "username": req.body.username,
        "exists": !!user
      });
    });
  };
};

module.exports.outputUser = function(req, res, next) {
  res.json({
    email: res.locals.email,
    user: res.locals.user
  });
};

module.exports.updateUserWithBody = function (User) {
  return function(req, res, next) {
    User.updateUser(res.locals.user.email, req.body, function(err, user) {
      if (err) {
        return res.json({
          "error": "Login database error",
          "login_error": err instanceof Error ? err.toString() : err
        });
      }

      if (!user) {
        return res.json({
          "error": "User with email `" + res.locals.user.email + "` not found"
        });
      }

      res.locals.user = user;
      process.nextTick(next);
    });
  };
};
