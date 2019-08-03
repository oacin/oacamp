const Campground = require("../models/campground.js"),
	  Comment = require("../models/comment.js"),
	  User = require("../models/user.js");

//ALL THE MIDDLEWARES GOES HERE
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if(err || !foundCampground) {
				console.log(err);
				req.flash("error", "Campground not found, sorry!");
				res.redirect("/campgrounds");
			} else {
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do this!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		req.flash("error", "Dumbo! You must be logged in...");
		res.redirect("/campgrounds");
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if(err || !foundComment) {
				console.log(err);
				req.flash("error", "Comment not found, sorry!");
				res.redirect("/campgrounds");
			} else {
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do this!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		req.flash("error", "Dumbo! You must be logged in...");
		res.redirect("/campgrounds");
	}
};

middlewareObj.checkUserOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		User.findById(req.params.id, (err, foundUser) => {
			if(err || !foundUser) {
				console.log(err);
				req.flash("error", "User not found, sorry!");
				res.redirect("/campgrounds");
			} else {
				if(foundUser._id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do this!");
					res.redirect("/campgrounds");
				}
			}
		});
	} else {
		req.flash("error", "Dumbo! You must be logged in...");
		res.redirect("/campgrounds");
	}
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Dumbo! You must be logged in...");
	res.redirect("/login");
};

module.exports = middlewareObj;