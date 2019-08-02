const express = require("express"),
	  router = express.Router(),
	  middleware = require("../middleware"),
	  Campground = require("../models/campground");

//INDEX
router.get("/", (req, res) => {
	Campground.find({}, (err, allCampgrounds) => {
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, page: "campgrounds"});
		}
	});
});

//NEW FORM
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//CREATE
router.post("/", middleware.isLoggedIn, (req, res) => {
	var name = req.body.name, 
		image = req.body.image, 
		description = req.body.description,
		author = {
			id: req.user._id,
			username: req.user.username
		},
		price = req.body.price,
		newCampground =  {name: name, image: image, description: description, author: author, price: price};
	
	Campground.create(newCampground, (err, newCampground) => {
		if(err) {
			console.log(err);
		} else {
			console.log("New Campground added to the DB! Name: ");
			console.log(newCampground);
			res.redirect("/campgrounds"); //redirects always as a get request
		}
	});
});

//SHOW
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err || !foundCampground) {
			req.flash("error", "Campground not found!");
			res.redirect("back");
		} else {
			console.log(foundCampground);
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

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		req.flash("success", "Campground successfully changed!");
		res.redirect("/campgrounds/" + updatedCampground._id);
	});
});

//DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, err => {
		req.flash("error", "Campground removed!");
		res.redirect("/campgrounds");
	});
});

module.exports = router;