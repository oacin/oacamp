const express = require("express"),
	  router = express.Router({mergeParams: true}),
	  Campground = require("../models/campground"),
	  middleware = require("../middleware"),
	  Comment = require("../models/comment");

//NEW FORM
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found!");
			res.redirect("back");
		} else {
			res.render("comments/new", {campground: foundCampground});
		}
	});
});


//CREATE
router.post("/", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, (err, newComment) => {
				if(err) {
					console.log(err);
					req.flash("error", "Something went wrong!");
					res.redirect("back");
				} else {
					newComment.author.id = req.user._id; //PLUGIN ID DO NEW COMMENT
					newComment.author.username = req.user.username; //PLUGIN USERNAME DO NEW COMMENT
					newComment.save(); //SAVING COMMENT
					foundCampground.comments.push(newComment);
					foundCampground.save();
					req.flash("success", "Comment successfully added!");
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});
		}
	});
});

//EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found!");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		});
	});
});

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		req.flash("success", "Comment successfully changed!");
		res.redirect("/campgrounds/" + req.params.id);
	});
});

//DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, err => {
		req.flash("error", "Comment deleted!");
		res.redirect("/campgrounds/" + req.params.id);
	});
});

module.exports = router;