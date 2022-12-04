const jwt = require('jsonwebtoken');
const {
  Users,
} = require('../service/schemas/userMadal');
const {
  HttpCode,
} = require('../config/constants');
require('dotenv').config();
const secret = process.env.SECRET;
const bcrypt = require('bcryptjs');

// signup
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await Users.findOne({ email });

  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: 'Email is use',
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log(newUser);

    const token = jwt.sign(
      { _id: newUser._id },
      secret,
      {
        expiresIn: '10h',
      }
    );

    await Users.findByIdAndUpdate(
      { _id: newUser._id },
      { token },
      { new: true }
    );

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        message: 'Registration successful',
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: token
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
  return res.status(HttpCode.OK).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription
    }});
};

// logout
const logout = async (req, res, next) => {
  const id = req.user._id;
  await Users.updateOne({ _id: id }, { token: null })
  return res.status(HttpCode.NO_CONTENT).json({ messange: "No Content" });
};

// current
const current = async (req, res, next) => {
  const { username, email, subscription  } = req.user;
  res.status(HttpCode.OK).json({
    status: 'success',
    code: 200,
    data: {
      message: `Authorization was successful: ${username}`,
      email: email,
      subscription: subscription
    },
  });
};

module.exports = {
  signup,
  login,
  logout,
  current,
};
