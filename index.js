require('dotenv').config();
const mongo = require('./config/mongo');
mongo.connect();
const app = require('./config/app');
app.initServer();
const reload = require('./config/reload');
reload.reloadStores();