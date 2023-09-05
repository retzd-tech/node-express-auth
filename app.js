const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const adminRoutes = require('./api/AdminRoutes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// CORS
var corsOptions = {
  origin: process.env.HOSTNAME,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
}
// app.use(cors(corsOptions));

// BodyParser Middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());

// Express Session
app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: false }));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
// Health check endpoint
app.get('/', (req, res) => {
  res.send('Development API is healthy');
});

app.use('/api/admin', adminRoutes);

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./documentation.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
