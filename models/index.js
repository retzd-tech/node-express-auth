const mongoose = require("mongoose");

// const URL = 'mongodb+srv://edvenger:bup*2Cgv@pH3qhMW@edvengers-3uin2.mongodb.net/test?retryWrites=true&w=majority';
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;
const URL =
  `mongodb+srv://${USERNAME}:${PASSWORD}@edvengers.3uin2.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`;

  mongoose.connect(URL, {
    useNewUrlParser: true,
});

const db = mongoose.connection;
db.once("open", () => console.log("connected to the database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));
