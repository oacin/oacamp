const Campground = require("../models/campground.js"),
	  Comment = require("../models/comment.js");

//ALL THE MIDDLEWARES GOES HERE
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if(err || !foundCampground) {
				console.log(err);
				req.flash("error", "Campground not found, sorry!");
				res.redirect("back");
			} else {
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do this!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "Dumbo! You must be logged in...");
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if(err || !foundComment) {
				console.log(err);
				req.flash("error", "Comment not found, sorry!");
				res.redirect("back");
			} else {
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
					next();
				} else {
					req.flash("error", "You don't have permission to do this!");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "Dumbo! You must be logged in...");
		res.redirect("back");
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