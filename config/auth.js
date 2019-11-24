module.exports = {
	isNotAuthenticated: function (req, res, next) {
		if (!req.isAuthenticated()) return next();
		res.redirect('/dashboard');
	},
	isAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) return next();
		req.flash('error_msg', "You are not logged in!");
		res.redirect('/auth/login');
	}
}