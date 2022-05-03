const path = require("path");
require('dotenv').config({path: path.resolve(__dirname,'./.env')});
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');

const app = express();
const port = 5000;

connectToMongo();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require('./routes/auth.js'));
app.use("/api/posts", require('./routes/post.js'));
app.use("/api/message", require('./routes/message.js'));

app.listen(port, ()=> {
    console.log(`Server started successfully at port ${port}`);
});