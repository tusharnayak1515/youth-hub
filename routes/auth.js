// This file will contain code that will manage all functionalities related to user authentication

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const secret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fetchUser = require('../middlewares/fetchUser');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

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
    body("password", "Password cannot be empty!").exists()
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

// ROUTE-4: Edit user profile using PUT "/api/auth/edit-profile". Login required
router.put("/edit-profile", fetchUser,[
    body("name", "Name cannot be less than 5 characters!").isLength({min: 5}),
    body("username", "Username cannot be less than 5 characters!").isLength({min: 5}),
    body("email", "Enter a valid email!").isEmail(),
], async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const {name,username,email} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.json({success, error: errors.array()[0].msg, status: 400});
    }

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 400});
        }

        let updateduser = {
            name: user.name,
            username: user.username,
            email: user.email
        }

        if(name !== user.name) {
            updateduser.name = name;
        }

        if(username !== user.username) {
            updateduser.username = username;
        }

        if(email !== user.email) {
            updateduser.email = email;
        }

        let userUsername = await User.findOne({username: updateduser.username});
        if(userUsername) {
            success = false;
            return res.json({success, error: "This username is already taken!", status: 400});
        }

        let userEmail = await User.findOne({email: updateduser.email});
        if(userEmail) {
            success = false;
            return res.json({success, error: "This email is associated to another account!", status: 400});
        }

        user = await User.findByIdAndUpdate(userId, {name: updateduser.name, username: updateduser.username, email: updateduser.email}, {new: true})
            .populate("followers", "_id name username profilepic")
            .populate("following", "_id name username profilepic")
            .populate("posts", "_id images caption");
        success = true;
        return res.json({success, user, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-5: Add profile picture using PUT "/api/auth/add-dp". Login required
router.put("/add-dp", fetchUser,[
    body("image", "Image cannot be empty!").exists()
], async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const {image} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.json({success, error: errors.array()[0].msg, status: 400});
    }

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        user = await User.findByIdAndUpdate(userId, {profilepic: image}, {new: true})
            .populate("followers", "_id name username profilepic")
            .populate("following", "_id name username profilepic")
            .populate("posts", "_id images caption");
        success = true;
        return res.json({success, user, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-6: Follow a user account using PUT "/api/auth/follow/:id". Login required
router.put("/follow/:id", fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const followeduserId = req.params.id;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let followeduser = await User.findById(followeduserId);
        if(!followeduser) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }
        
        if(!user.following.includes(followeduser)) {
            user = await User.findByIdAndUpdate(userId,{$push: {following: followeduser}},{new: true});
        }
        else {
            success = false;
            return res.json({success, error: "You are already following this user!", status: 400});
        }

        if(!followeduser.followers.includes(user)) {
            followeduser = await User.findByIdAndUpdate(followeduserId,{$push: {followers: user}},{new: true});
        }
        else {
            success = false;
            return res.json({success, error: "You are already following this user!", status: 400});
        }

        user = await User.findById(userId)
            .populate("followers", "_id name username profilepic")
            .populate("following", "_id name username profilepic")
            .populate("posts", "_id images caption");

        success = true;
        return res.json({success, user, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-7: Unfollow a user account using PUT "/api/auth/unfollow/:id". Login required
router.put("/unfollow/:id", fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const followeduserId = req.params.id;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let followeduser = await User.findById(followeduserId);
        if(!followeduser) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }
        
        if(user.following.includes(followeduser)) {
            user = await User.findByIdAndUpdate(userId,{$pull: {following: followeduser}},{new: true});
        }
        else {
            success = false;
            return res.json({success, error: "You are not following this user!", status: 400});
        }

        if(followeduser.followers.includes(user)) {
            followeduser = await User.findByIdAndUpdate(followeduserId,{$pull: {followers: user}},{new: true});
        }
        else {
            success = false;
            return res.json({success, error: "You are not following this user!", status: 400});
        }

        user = await User.findById(userId)
            .populate("followers", "_id name username profilepic")
            .populate("following", "_id name username profilepic")
            .populate("posts", "_id images caption");

        success = true;
        return res.json({success, user, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

// ROUTE-8: Delete an existing user account using DELETE "/api/auth/deleteuser". Login required
router.delete("/deleteuser", fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 400});
        }

        for(let i=0; i<user.followers.length; i++) {
            let id = user.followers[i]._id.toString();
            let follower = await User.findByIdAndUpdate(id,{$pull: {following: user}},{new: true});
        }

        for(let i=0; i<user.following.length; i++) {
            let id = user.following[i]._id.toString();
            let following = await User.findByIdAndUpdate(id,{$pull: {followers: user}},{new: true});
        }
        
        let posts = await Post.deleteMany({user: userId});
        let comments = await Comment.deleteMany({user: userId});
        user = await User.findByIdAndDelete(userId, {new: true});

        success = true;
        return res.json({success, msg: "User Successfully deleted!", status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500})
    }
});

module.exports = router;