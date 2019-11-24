const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const SessionSchema = new mongoose.Schema({
	course: { type: ObjectId, ref: "Course", required: true },
	student: { type: ObjectId, ref: "User", required: true },
	tutor: { type: ObjectId, ref: "User", required: true },
	time: {
		start: { type: Date, required: true },
		duration: { type: Number, default: 1 }
	}
});

module.exports = mongoose.model('Session', SessionSchema);