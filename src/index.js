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


app.use('/api',userRoutes)


const path = require('path');
app.use(express.static('public'))
app.set('view engine', 'ejs');
const serverless = require('serverless-http');

module.exports = app;
module.exports.handler = serverless(app);


app.get('/', async function (req, res) {
    res.render('index');
});

app.get('/about', async function (req, res) {
    res.render('about');
});

app.get('/booking', async function (req, res) {
    res.render('booking');
});


app.get('/contact', async function (req, res) {
    res.render('contact');
});
app.get('/login', async function (req, res) {
    res.render('login');
});

app.get('/register', async function (req, res) {
    res.render('Register');
});
app.get('/menu', async function (req, res) {
    res.render('menu');
});
app.get('/service', async function (req, res) {
    res.render('service');
});
app.get('/team', async function (req, res) {
    res.render('team');
});
app.get('/testimonial', async function (req, res) {
    res.render('testimonial');
});
const port = process.env.PORT || 3001;

const host = '0.0.0.0'; // Listen on all available network interfaces
app.listen(port, host, () => {
    console.log(`Mr Vipin Your Serveer is Running on server ${port}`)
})