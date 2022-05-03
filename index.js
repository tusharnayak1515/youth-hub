const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());

// app.use();
// app.use();

app.listen(port, ()=> {
    console.log(`Server started successfully at port ${port}`);
});