const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/auth/addStudent", (req, res) => {
  res.render("addStudent");
});
module.exports = router;
