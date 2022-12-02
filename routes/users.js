const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  current,
} = require('../controllers/users');
const { auth } = require('../middlewares/auth');
const {
    validateRegistration,
    validateLogin,
  } = require("../middlewares/validationUser");

router.post('/signup',validateRegistration, signup);
router.post('/login',validateLogin, login);
router.get('/logout', auth, logout);
router.get('/current', auth, current);
module.exports = router;
