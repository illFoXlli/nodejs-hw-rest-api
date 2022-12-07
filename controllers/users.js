const jwt = require('jsonwebtoken');
const { Users } = require('../service/schemas/userMadal');
const { HttpCode } = require('../config/constants');
require('dotenv').config();
const secret = process.env.SECRET;
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar/lib/gravatar');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { uuid } = require('uuidv4');

// signup
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await Users.findOne({ email });
  const verificationToken = uuid();

  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: 'Email is use',
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email);

    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatarURL,
      verificationToken,
    });
    // ==================================
    const msg = {
      to: email, // Change to your recipient
      from: 'den.r.m.1986@gmail.com',
      subject: 'Пожалуйста, подтвердите свою личность отправителя',
      text: 'Давайте подтвердим вашу личность отправителя, чтобы вы могли начать отправку.',
      html: `<strong>Нажми <a href="http://localhost:3001/api/users/verify/${verificationToken}">Нажми для подтверждения</a></strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch(error => {
        console.error(error);
      });
    // =========================================
    // const emailService = new EmailService(process.env.NODE_ENV, new CreateSenderSendGrid());
    // const statusEmail = await emailService.sendVerifyEmail(newUser.email, newUser.name, newUser.verifyTokenEmail);
    // ===================================
    const token = jwt.sign({ _id: newUser._id }, secret, {
      expiresIn: '10h',
    });

    await Users.findByIdAndUpdate({ _id: newUser._id }, { token }, { new: true });

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        message: 'Registration successful',
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: token,
        avatar: avatarURL,
      },
    });
  } catch (e) {
    next(e);
  }
};

// login
const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });

  if (!user || !user.isValidPassword(password)) {
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: 400,
      message: 'Incorrect Login or password',
      data: 'Bad request',
    });
  }

  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: '10h',
  });

  if (!user.verify) {
    const msg = {
      to: email, // Change to your recipient
      from: 'den.r.m.1986@gmail.com',
      subject: 'Пожалуйста, подтвердите свою личность отправителя',
      text: 'Давайте подтвердим вашу личность отправителя, чтобы вы могли начать отправку.',
      html: `<strong>Нажми <a href="http://localhost:3001/api/users/verify/${user.verificationToken}">Нажми для подтверждения</a></strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch(error => {
        console.error(error);
      });

    return res.status(401).json({
      message: 'mail not verified',
    });
  }

  return res.status(HttpCode.OK).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

// logout
const logout = async (req, res, next) => {
  const id = req.user._id;
  await Users.updateOne({ _id: id }, { token: null });
  return res.status(HttpCode.NO_CONTENT).json({ messange: 'No Content' });
};

// current
const current = async (req, res, next) => {
  const { username, email, subscription } = req.user;
  res.status(HttpCode.OK).json({
    status: 'success',
    code: 200,
    data: {
      message: `Authorization was successful: ${username}`,
      email: email,
      subscription: subscription,
    },
  });
};

// updateAvatar
const updateAvatar = async (req, res) => {
  const avatarsPath = path.join(__dirname, '../', 'public', 'avatars');
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsPath, fileName);
  await fs.rename(tempUpload, resultUpload);
  const resizeImage = await Jimp.read(resultUpload);
  resizeImage.resize(250, 250).write(resultUpload);
  const avatarURL = path.join('avatars', fileName);
  await Users.updateOne({ _id }, { avatar: avatarURL });
  res.json({
    avatarURL,
  });
};

// verifyUser
const verifyUser = async (req, res, next) => {
  const user = await Users.findOne({ verificationToken: req.params.token });
  if (user) {
    await Users.updateOne({ _id: user._id }, { verify: true, verificationToken: null });
    return res.status(200).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        message: 'Verification successful!',
      },
    });
  }
  return res.status(400).json({
    status: 'error',
    code: 400,
    message: 'Invalid token',
  });
};

// verifySecond
const verifySecond = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: 400,
      message: 'Incorrect Login or password',
      data: 'Bad request',
    });
  }

  if (!user.verify) {
    const msg = {
      to: email, // Change to your recipient
      from: 'den.r.m.1986@gmail.com',
      subject: 'Пожалуйста, подтвердите свою личность отправителя',
      text: 'Давайте подтвердим вашу личность отправителя, чтобы вы могли начать отправку.',
      html: `<strong>Нажми <a href="http://localhost:3001/api/users/verify/${user.verificationToken}">Нажми для подтверждения</a></strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch(error => {
        console.error(error);
      });

    return res.status(200).json({
      message: 'Verification email sent',
    });
  }

  return res.status(400).json({
    message: 'Verification has already been passed',
  });
};

module.exports = {
  signup,
  login,
  logout,
  current,
  updateAvatar,
  verifyUser,
  verifySecond,
};
