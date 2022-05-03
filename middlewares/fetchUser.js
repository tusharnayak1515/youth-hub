// This middleware will verify if a user is logged-in or not

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

const fetchUser = (req, res, next)=> {
    let success = false;
    const token = req.header("auth-token");

    if(!token) {
        success = false;
        return res.json({success, error: "Please authenticate with valid token", status: 401});
    }

    try {
        const data = jwt.verify(token,secret);
        req.user = data.user;
        next();
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 401});
    }
};

module.exports = fetchUser;