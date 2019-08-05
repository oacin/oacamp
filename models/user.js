const mongoose = require("mongoose"),
	  passportLocalMongoose =  require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: String,
	avatar: {type: String, default: "https://process.filestackapi.com/AIsgBhhXAQiO1fMgTiIKSz/resize=width:650,height:650,fit:scale,align:center/rotate=deg:exif/https://cdn.trustwork.com/images/internal_assets/default-profile-img-1.png"},
	firstName: {type: String, default: "Your"},
	lastName: {type: String, default: "Name"},
	email: {type: String, unique: true, required: true},
	resetPasswordToken: String,
    resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);