const express = require("express"), 
	  app = express(), 
	  bodyParser = require("body-parser"), 
	  mongoose = require("mongoose"),
	  flash = require("connect-flash"),
	  passport = require("passport"),
	  LocalStrategy = require("passport-local"),
	  methodOverride = require("method-override"),
	  Campground = require("./models/campground"),
	  Comment = require("./models/comment"),
	  User =  require("./models/user"),
	  seedDB = require("./seeds");

const commentRoutes = require("./routes/comments"),
	  campgroundRoutes = require("./routes/campgrounds"),
	  indexRoutes = require("./routes/index");

//DB CONNECTION
mongoose.connect("mongodb://localhost/yelp_camp", {
	useNewUrlParser: true,
	useFindAndModify: false,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log("ERROR: ", err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.set("view engine", "ejs");

//seedDB(); //SEEDING DB WITH SOME DATA

//PASSPORT CONFIG
app.use(require("express-session")({
	secret: "This would be great mrs Oacin",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//PASSING ~ SOMETHING ~ TO ALL ROUTES AT ONCE 
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//USING THE CREATED ROUTES
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

app.listen(3000, () => {
	console.log("The YelpCamp server has started! PORT 3000");
});