const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
	code: { type: String }
});

module.exports = mongoose.model('Course', CourseSchema);