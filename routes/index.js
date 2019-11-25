const express = require('express');
const router = express.Router();
const { isAuthenticated, isNotAuthenticated } = require('../config/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Session = require('../models/Session');
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

router.get('/', isNotAuthenticated,(req, res) => res.render('home'));
router.get('/dashboard', isAuthenticated, async (req, res) => {
	
	// find sessions
	let now = new Date();
	for (let i = 0; i < req.user.sessions.length; i++) {
		await Session.findOne({_id: req.user.sessions[i]})
			.populate('course')
			.populate('student')
			.populate('tutor')
			.then(session => {
				if (session.time.start < now) return;
				req.user.sessions[i] = session;
			})
			.catch(err => console.log(err));
	}
	
	for (let i = 0; i < req.user.sessions.length; i++) {
		console.log("========================");
		console.log(typeof req.user.sessions[i]);
		console.log(req.user.sessions[i]);
		console.log("========================");

	}
	console.log(req.user.sessions);
	// req.user.sessions = req.user.sessions.filter(x => typeof(x) == 'object');
	// console.log('========================');
	// console.log(req.user.sessions);

	// find course matches here
	student_opportunities = [];
	await User.find({})
		.populate('sessions')
		.then(users => {
			users.forEach(other_user => {
				if (other_user._id.toString() == req.user._id.toString()) return; 
				// student 
				req.user.student.courses.forEach(async course => { 
					if (other_user.tutor.courses.includes(course)) { 
						// check if availabilities match 
						for (let i = 0; i < days.length; i++) { 
							let key = days[i] 
							let intersect = other_user.availability[key].filter(e => req.user.availability[key].includes(e));
							// remove times already scheduled
							for (let m = 0; m < other_user.sessions.length; m++) {
								if (other_user.sessions[m].time.start.getDay() == i+1) {
									let idx = intersect.indexOf(other_user.sessions[m].time.start.getHours());
									if (idx != -1) {
										intersect.splice(idx, 1);
									}
								}
							}
							if (intersect.length > 0) { 
								student_opportunities.push({
									course: course,
									student: req.user,
									tutor: other_user,
									day: key,
									hours: intersect
								});
								break;
							}
						}
					}
				});
			});
		})
		.catch(err => console.error(err));

	for (let i = 0; i < student_opportunities.length; i++) {
		await Course.find({_id: student_opportunities[i].course})
			.then(course => student_opportunities[i].course = course)
			.catch(err => console.error(err));
	}

	console.log(req.user);
	res.render('dashboard', {
		user: req.user,
		student_opportunities
	});
});
router.get('/edit_availability', isAuthenticated, (req, res) => {
	res.render('edit_availability', {
		user: req.user
	});
});
router.get('/edit_courses', isAuthenticated, (req, res) => {

	Course.find({})
		.then(courses => {
			courses.sort((a,b) => {
				let A = a.code.toUpperCase();
				let B = b.code.toUpperCase();
				if (A < B) return -1;
				if (A > B) return 1;
				return 0;
			});
			res.render('edit_courses', {
				user: req.user,
				courses: courses
			});
		})
		.catch(err => console.error(err));
});

module.exports = router;