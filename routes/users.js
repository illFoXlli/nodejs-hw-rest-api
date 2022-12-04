const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  current,
  updateAvatar,
} = require('../controllers/users');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/multerFile');
const {
    validateRegistration,
    validateLogin,
  } = require("../middlewares/validationUser");

router.post('/signup',validateRegistration, signup);
router.post('/login',validateLogin, login);
router.get('/logout', auth, logout);
router.get('/current', auth, current);
router.patch('/avatars', auth, upload.single("avatars"), updateAvatar);

module.exports = router;

