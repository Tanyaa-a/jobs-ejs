const User = require("../models/User");
 const parseVErr = require("../utils/parseValidationErrs");

 const registerShow = (req, res) => {
   res.render("register");
 };

 const registerDo = async (req, res) => {
  try {
    if (req.body.password !== req.body.password1) {
      throw new Error("The passwords do not match.");
    }
    await User.create(req.body);
    res.redirect("/");
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
     } else {
       req.flash("error", e.message);
     }
     res.render("register", { errors: req.flash("error")});
   }
 };

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
 };

 const logonShow = (req, res) => {
     return req.user ? res.redirect("/") : res.render("logon");
 };
 module.exports = {
   registerShow,
   registerDo,
   logoff,
   logonShow,
 };