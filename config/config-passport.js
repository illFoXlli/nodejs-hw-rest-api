const {Users} = require('../service/schemas/userMadal');
const passport = require('passport');
const passportJWT = require('passport-jwt');
require('dotenv').config();
const secret = process.env.SECRET;

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

// JWT Strategy
passport.use(
  new Strategy(params, function (payload, done) {
    Users.find({ _id: payload.id })
      .then(([user]) => {
        if (!user) {
          return done(new Error('User not found'));
        }
        return done(null, user);
      })
      .catch(err => done(err));
  }),
);