const express = require('express')
const app = express();
require('dotenv/config')
var cors = require('cors')
const cookieParser = require('cookie-parser')
app.use(cors())
const userRoutes = require('../Routes/UserRouter')
const morgan = require('morgan')
app.use(morgan('dev'))
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const dbConnect = require('../config/db');
const userModel = require('../models/userModel');
dbConnect();

app.use('/api', userRoutes)


const path = require('path');
app.use(express.static('public'))
app.set('view engine', 'ejs');
const serverless = require('serverless-http');

module.exports = app;
module.exports.handler = serverless(app);


app.get('/', async function (req, res) {
    res.render('index', { apiUrl: process.env.APIURL });
});

app.get('/about', async function (req, res) {
    res.render('about', { apiUrl: process.env.APIURL });
});

app.get('/booking', async function (req, res) {
    res.render('booking', { apiUrl: process.env.APIURL });
});


app.get('/contact', async function (req, res) {
    res.render('contact', { apiUrl: process.env.APIURL });
});
app.get('/login', async function (req, res) {
    res.render('login', { apiUrl: process.env.APIURL });
});

app.get('/register', async function (req, res) {
    res.render('Register', { apiUrl: process.env.APIURL });
});
app.get('/profile/:token', async function (req, res) {
    res.render('profile', { apiUrl: process.env.APIURL });
});
app.get('/menu', async function (req, res) {
    res.render('menu', { apiUrl: process.env.APIURL });
});

app.get('/service', async function (req, res) {
    res.render('service', { apiUrl: process.env.APIURL });
});


app.get('/resturant/:id', async function (req, res) {
    res.render('SingleResturant', { apiUrl: process.env.APIURL });
});


app.get('/team', async function (req, res) {
    res.render('team', { apiUrl: process.env.APIURL });
});
app.get('/testimonial', async function (req, res) {
    res.render('testimonial', { apiUrl: process.env.APIURL });
});
const port = process.env.PORT || 3001;

const host = '0.0.0.0'; // Listen on all available network interfaces
app.listen(port, host, () => {
    console.log(`Mr Vipin Your Serveer is Running on server ${port}`)
})