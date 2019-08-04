const express = require("express"),
	  router = express.Router(),
	  middleware = require("../middleware"),
	  multer = require("multer"),
	  cloudinary = require("cloudinary"),
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

//INDEX
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); //regex = regular expression
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});

//NEW FORM
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//CREATE
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		// add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
		// add image's public_id to campground object
		req.body.campground.imageId = result.public_id;
		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		};
		Campground.create(req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/campgrounds/' + campground.id);
		});
    });
});

//SHOW
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found!");
			res.redirect("back");
		} else {
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
		if(err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		// add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
		// add image's public_id to campground object
		req.body.campground.imageId = result.public_id;
		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		};
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
			req.flash("success", "Campground successfully changed!");
			res.redirect("/campgrounds/" + updatedCampground._id);
		});
    });
});

//DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, err => {
		req.flash("error", "Campground removed!");
		res.redirect("/campgrounds");
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;