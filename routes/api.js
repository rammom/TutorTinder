const express = require('express');
const router = express.Router();
const { isAuthenticated, isNotAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Session = require('../models/Session');
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

router.post('/edit_availability', isAuthenticated, (req, res) => {
	User.findOne({_id: req.user._id})
		.then(user => {
			if (!user) {
				req.flash('error_msg', "unknown error.")
				res.redirect('/auth/login');
			}
			for (let key in user.availability) {
				user.availability[key] = [];
			}
			for (let key in req.body) {
				if (/^[0-9]+\.[0-9]+$/.test(key)) {
					let day_hour = key.split(".");
					let day = parseInt(day_hour[0]);
					let hour = parseInt(day_hour[1]);
					user.availability[days[day]].push(hour);
				}
			}
			user.save()
				.then(user => {
					req.flash('success_msg', "Availability saved!")
					res.redirect('/dashboard');
				})
				.catch(err => console.error(err));
		})
		.catch(err => console.error(err));
});

router.post('/edit_courses', (req, res) => {
	User.findOne({_id: req.user._id})
		.then(async user => {
			if (!user) {
				req.flash('error_msg', "unknown error.")
				res.redirect('/auth/login');
			}
			// student
			user.student.courses = [];
			user.tutor.courses = [];
			for (let key in req.body) {
				if (key == 'fee') {
					user.tutor.fee = req.body[key];
				}
				else if (/^[0-9]+\..+$/.test(key)) {
					let st_code = key.split(".");
					let st = (st_code[0] == '0') ? "student" : "tutor";
					let code = st_code[1];
					await Course.findOne({code})
						.then(course => {
							if (!user) {
								req.flash('error_msg', "unknown error.")
								res.redirect('/auth/login');
							}
							user[st].courses.push(course._id);
						})
						.catch(err => console.error(err))
				}
			}
			user.save()
				.then(user => {
					req.flash('success_msg', "Availability saved!")
					res.redirect('/dashboard');
				})
				.catch(err => console.error(err));
		})
		.catch( err => console.error(err) );
});

router.post('/book_session', (req, res) => {
	const {student, tutor, course, day, hour} = req.body;


	// find date
	let required_day_index = days.indexOf(day)+1;
	let date = new Date();
	date.setHours(hour, 0, 0, 0);
	date.setDate(date.getDate() + 1);
	while (date.getDay() != required_day_index) {
		date.setDate(date.getDate() + 1);
	}

	let session = new Session({
		course,
		student,
		tutor,
		time: {
			start: date,
			duration: 1
		}
	})

	session.save()
		.then(session => {
			User.findOne({_id: student})
				.then(st => {
					st.sessions.push(session._id);
					st.save()
						.then(st => {
							User.findOne({_id: tutor})
								.then(tut => {
									tut.sessions.push(session);
									tut.save()
										.then(tut => {
											req.flash('success_msg', "Session booked!")
											res.redirect('/dashboard');
										})
										.catch(err => console.log(err));
								})
								.catch(err => console.log(err));
						})
						.catch(err => console.log(err));
				})
				.catch(err => console.log(err));
		})
		.catch(err => console.error(err));

});

router.post('/init_courses', async (req, res) => {
	let codes = ["COMP1000", "COMP1400", "COMP1410", "COMP2120", "COMP2140",
					"COMP2310", "COMP2540", "COMP3110", "COMP3540", "COMP3670"]
	for (let i = 0; i < codes.length; i++) {
		let course = new Course({
			code: codes[i]
		});
		await course.save()
			.catch(err => console.log(err));
	}

	res.send('done.')
});

module.exports = router;