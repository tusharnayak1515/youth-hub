// This file will contain code that will manage all functionalities related to posts

const express = require('express');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middlewares/fetchUser');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// ROUTE-1: Fetch all posts using GET "/api/posts/posts". Login required.
router.get("/",fetchUser, async (req,res)=> {
    let success = false;
    try {
        let posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment")
            .populate("comments.user", "_id name username profilepic");

        success = true;
        return res.json({success, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-2: Get details of a specific post using GET "/api/posts/:id". Login required.
router.get("/:id",fetchUser, async (req,res)=> {
    let success = false;
    try {
        let post = await Post.findById(req.params.id)
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user");

        if(!post) {
            success = false;
            return res.json({success, error: "Post not found!", status: 404})
        }
        success = true;
        return res.json({success, post, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-3: Add a post using POST "/api/posts/addpost". Login required.
router.post("/addpost",fetchUser,[
    body("images","You must add minimum 1 image to your post!").isArray({min: 1, max: 5})
], async (req,res)=> {
    let success = false;
    const {images,caption} = req.body;
    const userId = req.user.id;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        success = false;
        return res.json({success, error: errors.array()[0].msg, status: 400});
    }

    try {
        let user = await User.findById(userId);
        let post = await Post.create({
            images: images,
            caption: caption,
            user: user
        });
        
        user = await User.findByIdAndUpdate(userId,{$push: {posts: post}}, {new: true});

        success = true;
        return res.json({success, user, post, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

module.exports = router;