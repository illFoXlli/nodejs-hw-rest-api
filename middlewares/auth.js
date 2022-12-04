const passport = require('passport');
const {
  HttpCode,
} = require('../config/constants');
require('../config/config-passport');

const auth = (req, res, next) => {
  passport.authenticate(
    'jwt',
    { session: false },
    (err, user) => {
      if (!user || err) {
        return res
          .status(HttpCode.UNAUTHORIZED)
          .json({
            status: 'error',
            code: 401,
            message: 'Unauthorized',
            data: 'Unauthorized',
          });
      }
      req.user = user;
      console.log(req.user);
      next();
    }
  )(req, res, next);
};

module.exports = {
  auth,
};
