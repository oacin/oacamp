const express = require("express"),
	  router = express.Router(),
	  passport = require("passport"),
	  User = require("../models/user");

//ROOT PAGE
router.get("/", (req, res) => {
	res.render("landing");
});

//REGISTER FORM
router.get("/register", (req, res) => {
	res.render("register");
});

//CREATING USER
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/campgrounds");
		});
	});
});

//LOGIN FORM
router.get("/login", (req, res) => {
	res.render("login");
});

//LOGGING IN
router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), (req, res) => {
});

//LOGGING OUT
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

//OUT OF ROUTE
router.get("*", (req, res) => {
	res.send("OUT OF ROUTE!");
});

module.exports = router;