const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');
const app = express();
const routes = require('./routes/routes');
const dbConf = require('./config/database');


app.use(cors());
mongoose.Promise = global.Promise;

if (process.env.NODE_ENV == "test") {
    mongoose.connect(dbConf.testDB);
}
if (process.env.NODE_ENV === 'production') {
    console.log('prod');
    mongoose.connect(dbConf.prod);
}
if (process.env.NODE_ENV === 'development') {
    mongoose.connect(dbConf.dev, { config: { autoIndex: false } });
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.json());
app.use(logger('dev'));

routes(app);

module.exports = app;