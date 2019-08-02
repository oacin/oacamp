const express = require("express"),
	  router = express.Router(),
	  passport = require("passport"),
	  User = require("../models/user"),
	  Campground = require("../models/campground");

//ROOT PAGE
router.get("/", (req, res) => {
	res.render("landing");
});

//REGISTER FORM
router.get("/register", (req, res) => {
	res.render("register", {page: "register"});
});

//CREATING USER
router.post("/register", (req, res) => {
	var newUser = new User({
		username: req.body.username,
		avatar: req.body.avatar,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email
	});
	if(req.body.adminCode === "bankai"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			console.log(err);
			return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/campgrounds");
		});
	});
});

//LOGIN FORM
router.get("/login", (req, res) => {
	res.render("login", {page: "login"});
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

//USERS PROFILE

router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err || !foundUser._id){
			req.flash("error", "Something wrent wrong...");
			return res.redirect("/campgrounds");
		}
		Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
			if(err) {
				req.flash("error", "Something went wrong.");
				return res.redirect("/campgrounds");
			}
      		res.render("users/show", {user: foundUser, campgrounds: campgrounds, page: "users/show"});
    	});
  });
});

//OUT OF ROUTE
router.get("*", (req, res) => {
	res.render("outofroute");
});

module.exports = router;