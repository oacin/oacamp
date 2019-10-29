const express = require("express"),
	  router = express.Router({mergeParams: true}),
	  passport = require("passport"),
	  middleware = require("../middleware"),
	  multer = require("multer"),
	  cloudinary = require("cloudinary"),
	  User = require("../models/user"),
	  Campground = require("../models/campground");

//SETTING UP MULTER/CLOUDINARY IMG UPLOAD

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter});

cloudinary.config({ 
  cloud_name: 'oacin', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//NEW USER FORM
router.get("/register", (req, res) => {
	res.render("users/register", {page: "register"});
});

//CREATING USER
router.post("/register", (req, res) => {
	var newUser = new User({username: req.body.username, email: req.body.email});

	if(req.body.adminCode === "bankai"){
		newUser.isAdmin = true;
	}

	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		//***************** ERROR: BAD REQUEST *****************
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username + "!");
			res.redirect("/users/" + user._id);
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

router.put("/users/:id", middleware.checkUserOwnership, upload.single('avatar'), (req, res) => {
	if(!req.file) {
		var newData = req.body.user;

		User.findByIdAndUpdate(req.params.id, newData, (err, editedUser) => {
			if(err){
				req.flash("error", "Something went wrong...");
				return res.redirect("/users/" + req.params.id);
			}
			req.flash("success", "User updated successfully!");
			res.redirect("/users/" + editedUser._id);
		});
	} else {
		cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
			if(err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			// add cloudinary url for the image to the user object under image property
			req.body.user.avatar = result.secure_url;
			// add image's public_id to user object
			req.body.user.avatarId = result.public_id;

			var newData = req.body.user;

			User.findByIdAndUpdate(req.params.id, newData, (err, editedUser) => {
				if(err){
					req.flash("error", "Something went wrong...");
					return res.redirect("/users/" + req.params.id);
				}
				req.flash("success", "User updated successfully!");
				res.redirect("/users/" + editedUser._id);
			});
    	});
	}
});

//USERS PROFILE

router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err || !foundUser){
			req.flash("error", "User not found...");
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

module.exports = router;