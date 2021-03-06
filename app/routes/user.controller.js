var router = require("express").Router();
var path = require("path");

var staticFilesPath = path.join(__dirname, "..", "..", "public");

var UserModel;

module.exports = function(mongoose) {
	UserModel = require(path.join(__dirname, "..", "models", "user.model.js"))(mongoose);
	return router;
};

router.get("/", function(req, res) {
	if(req.session.userID && req.session.username) {
		res.sendFile(path.join(staticFilesPath, "chat.html"));
	} else {
		res.redirect("/login");
	}
	
});

router.get("/login", function(req, res) {
	res.sendFile(path.join(staticFilesPath, "login.html"));
});

router.post("/login", function(req, res) {
	var query = UserModel.findOne({username: req.body.username.toLowerCase()});
	query.exec(function(err, user) {
		var userFromDB = user;
		if(err) {
			console.log(err);
			res.redirect("/login");
		} else if(userFromDB) {
			// Continue with password check
			userFromDB.comparePassword(req.body.password, function(err, result) {
				if(err) {
					console.log(err);
					res.redirect("/login");
				}
				if(result) {
					 req.session.userID = userFromDB._id;
					 req.session.username = userFromDB.username;
					 console.log(`${userFromDB.username} logged in successfully!`);
					 res.redirect("/");
				} else {
					 res.redirect("/login");
				}
			});
		} else {
			// User not found
			res.redirect("/login");
		}
	});
});

router.get("/register", function(req, res) {
	res.sendFile(path.join(staticFilesPath, "register.html"));
});

router.post("/register", function(req, res) {
	var user = new UserModel({
		username: req.body.username,
		password: req.body.password,
		email: req.body.email,
    	firstName: req.body.firstName,
    	lastName: req.body.lastName
	});

	user.save(function(err) {
		if(err) {
			console.log(err);
			res.redirect("/register");
		} else {
			req.session.userID = user._id;
			req.session.username = user.username;
			res.redirect("/");
		}
	});
});

router.get("/logout", function(req, res) {
	req.session.destroy(function(err) {
		if(err) {
			console.log("error: "+err.message);
		}
	});
	res.redirect("/login");
});
