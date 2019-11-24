const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema({
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	availability: {
		monday: [Number],
		tuesday: [Number],
		wednesday: [Number],
		thursday: [Number],
		friday: [Number],
	},
	sessions: [{ type: ObjectId, ref: "Session" }],
	student: {
		courses: [{ type: ObjectId, ref: "Course" }]
	},
	tutor: {
		courses: [{ type: ObjectId, ref: "Course" }],
		fee: { type: Number, default: 0 }
	}
});

UserSchema.pre('save', function (next) {
	next();
});

module.exports = mongoose.model('User', UserSchema);