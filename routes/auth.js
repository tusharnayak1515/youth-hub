// This file will contain code that will manage all functionalities related to user authentication

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fetchUser = require('../middlewares/fetchUser');

const router = express.Router();

// ROUTE-1: Register a user using POST "/api/auth/register". Login not required
router.post("/register",[
    body("name", "Name cannot be less than 5 characters!").isLength({min: 5}),
    body("username", "Username cannot be less than 5 characters!").isLength({min: 5}),
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password cannot be less than 8 characters and must contain atleast 1 uppercase, 1 lowercase, number and special character")
        .isLength({min: 8})
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
], async (req,res)=> {
    let success = false;
    const {name,username,email,password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.json({success, error: errors.array()[0].msg, status: 400});
    }

    try {
        let userEmail = await User.findOne({email: email});
        if(userEmail) {
            success = false;
            return res.json({success, error: "This email is associated to another account!", status: 400})
        }

        let userUsername = await User.findOne({username: username});
        if(userUsername) {
            success = false;
            return res.json({success, error: "This username is already taken!", status: 400})
        }

        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password,salt);

        let user = await User.create({
            name: name,
            username: username,
            email: email,
            password: securePassword
        });

        const data = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, secret);
        success = true;
        return res.json({success, authToken, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-2: Login an existing user using POST "/api/auth/login". Login not required
router.post("/login",[
    body("email", "Enter a valid email!").isEmail(),
    body("password", "Password cannot be less than 8 characters and must contain atleast 1 uppercase, 1 lowercase, number and special character")
        .isLength({min: 8})
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/)
], async (req,res)=> {
    let success = false;
    const {email,password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.json({success, error: errors.array()[0].msg, status: 400});
    }

    try {
        let user = await User.findOne({email: email});
        if(!user) {
            success = false;
            return res.json({success, error: "No account is found with this email!", status: 400});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare) {
            success = false;
            return res.json({success, error: "Wrong credentials!", status: 400});
        }

        const data = {
            user: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, secret);
        success = true;
        return res.json({success, authToken, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-3: Get user profile using GET "/api/auth/profile". Login required
router.get("/profile", fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    try {
        let user = await User.findById(userId)
            .populate("followers", "_id name username profilepic")
            .populate("following", "_id name username profilepic")
            .populate("posts", "_id images caption");
            // .populate("posts.user", "_id name username profilepic")
            // .populate("posts.reviews", "_id comment")
            // .populate("posts.reviews.user", "_id name username profilepic")
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 400});
        }

        success = true;
        return res.json({success, user, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

module.exports = router;