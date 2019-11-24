const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { isAuthenticated, isNotAuthenticated } = require('../config/auth');

router.get('/login', isNotAuthenticated, (req, res) => res.render('login'));
router.get('/register', isNotAuthenticated, (req, res) => res.render('register'));

router.post('/register', (req, res) => {
	const { fname, lname, email, password, password2 } = req.body;
	let errors = [];

	// validate
	if (!fname || !lname || !email || !password || !password2) {
		errors.push({ msg: "Please fill in all fields" });
	}
	if (password != password2) {
		errors.push({ msg: "Passwords do not match" });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors,
			fname,
			lname,
			email,
			password,
			password2
		})
	}
	else {
		User.findOne({email})
			.then(user => {
				if (user) {
					errors.push({ msg:"Email already linked to user!" })
					res.render('register', {
						errors,
						fname,
						lname,
						email,
						password,
						password2
					})
				}
				else {
					const newUser = new User({
						fname,
						lname,
						email,
						password
					});

					bcrypt.genSalt(10, (err, salt) => {
						if (err) throw err;
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err;
							newUser.password = hash;
							newUser.save()
								.then(user => {
									req.flash('success_msg', "Registration complete! Please login.")
									res.redirect('/auth/login')
								})
								.catch(err => console.error(err));
						})
					})
				}
			})
			.catch();
	}
});

router.post('/login', isNotAuthenticated, (req, res, next) => {
	passport.authenticate('local', { 
		successRedirect: '/dashboard',
		failureRedirect: '/auth/login',
		failureFlash: true
	})(req, res, next);
});

router.get('/logout', isAuthenticated, (req, res) => {
	req.logout();
	req.flash('success_msg', "You are logged out");
	res.redirect('/auth/login');
});

module.exports = router;