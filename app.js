//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

console.log(process.env.API_KEY);

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
  useNewUrlparser: true,
});

const userSchema = {
  email: "string",
  password: "string",
};

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const Username = req.body.Username;
    const password = req.body.password;

    User.findOne({ email: req.body.username })
      .then(function (foundUser) {
        if (foundUser) {
          if (foundUser.password === req.body.password) {
            res.render("secrets");
          } else {
            res.send("Wrong password");
          }
        } else {
          res.send("User not found");
        }
      })
      .catch(function (err) {
        console.log("Error: ", err);
      });
  });

app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    const newUser = new User({
      email: req.body.username,
      password: req.body.password,
    });
    newUser
      .save()
      .then(function () {
        res.render("secrets");
      })
      .catch(function (err) {
        res.send("An error occurred.");
      });
  });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
