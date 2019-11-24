const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport'); 
require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("* Connected to Mongo"))
	.catch( err => console.error(err) );

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Session
app.use(session({
	secret: 'fjakfh2q73q8hueohda',
	resave: true,
	saveUninitialized: true
}))

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Globals
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));


app.listen(PORT, console.log(`Server started on port ${PORT}`));