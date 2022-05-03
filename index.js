const path = require("path");
require('dotenv').config({path: path.resolve(__dirname,'./.env')});
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');

const app = express();
const port = 5000;

connectToMongo();
app.use(cors());

// app.use();
// app.use();

app.listen(port, ()=> {
    console.log(`Server started successfully at port ${port}`);
});