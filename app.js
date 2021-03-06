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
	  userRoutes = require("./routes/users"),
	  indexRoutes = require("./routes/index");

//DB CONNECTION
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url, {
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

app.locals.moment = require("moment");

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
app.use(userRoutes);
app.use(indexRoutes);

const port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log("Server Has Started!");
});