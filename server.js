require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const {
  connectMongo,
} = require('./service/connectionMongoose.js');
const contactsRouter = require('./routes/contacts.js');
const userRouter = require('./routes/users.js');
const app = express();
const formatsLogger =
  app.get('env') === 'development'
    ? 'dev'
    : 'short';

app.use(logger(formatsLogger));
app.use(express.json());
app.use(cors());

app.use(
  '/avatars',
  express.static('public/avatars')
);
app.use('/api/contacts', contactsRouter);
app.use('/api/users', userRouter);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Not found',
  });
});
app.use((err, req, res, next) => {
  res.status(500).json({
    status: 'fail',
    code: 500,
    message: err.message,
    data: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 8082;
const start = async () => {
  try {
    await connectMongo();

    app.listen(PORT, err => {
      if (err) {
        console.error(
          'Error at a server launch:',
          err
        );
      }
      console.log(
        `Server running. Use our API on port: ${PORT}`
      );
    });
  } catch (arror) {}
};

start();

module.exports = app;
