const express = require("express"),
	  router = express.Router({mergeParams: true}),
	  middleware = require("../middleware"),
	  User = require("../models/user");

//NEW USER FORM
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

//EDITING USER
router.get("/users/:id/edit", middleware.checkUserOwnership, (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err){
			req.flash("error", "Something went wrong...");
			return res.redirect("back");
		}
		res.render("users/edit", {user: foundUser});
	});
});

router.put("/users/:id", middleware.checkUserOwnership, (req, res) => {
	var newUser = {
		avatar: req.body.avatar,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		adminCode: req.body.adminCode
	};
	User.findByIdAndUpdate(req.params.id, newUser, (err, editedUser) => {
		if(err){
			req.flash("error", "Something went wrong...");
			return res.redirect("/users/" + req.params.id);
		}
		req.flash("success", "User updated successfully!");
		res.redirect("/users/" + req.params.id);
	});
});

module.exports = router;