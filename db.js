const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

const connectToMongo = ()=> {
    try {
        mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, ()=> {
            console.log("Connected to mongoDB successfully");
        });
    } catch (error) {
        console.log(error.message);
    }
}

module.exports =  connectToMongo;