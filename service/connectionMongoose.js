const mongoose = require('mongoose');
const exit = require('node:process');

function connectMongo() {
  return mongoose
    .connect(process.env.MONGO_UGL, {
      useNewUrlParser: true,
    })
    .then(() =>
      console.log(
        'Database connection successful'
      )
    )
    .catch(err => {
      console.log('DB error', err);
      exit(1);
    });
}

module.exports = {
  connectMongo,
};

// mongoose
//   .connect(process.env.MONGODB_URL)
//   .then(() => console.log("Database connection successful"))
//   .catch((err) => {
//     console.log("DB error", err);
//     exit(1);
//   });
