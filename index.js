require('dotenv').config();
const mongo = require('./config/mongo');
mongo.connect();
const app = require('./config/app');
app.initServer();