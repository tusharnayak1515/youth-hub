// This file will contain code that will manage all functionalities related to posts

const express = require('express');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middlewares/fetchUser');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// ROUTE-1: Fetch all posts using GET "/api/posts/posts". Login required.
router.get("/",fetchUser, async (req,res)=> {
    let success = false;
    try {
        let posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

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
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }
        
        let post = await Post.create({
            images: images,
            caption: caption,
            user: user
        });
        
        user = await User.findByIdAndUpdate(userId,{$push: {posts: post}}, {new: true});

        const posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

        success = true;
        return res.json({success, user, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-3: Edit a post using PUT "/api/posts/editpost:postId". Login required.
router.post("/editpost/:postId",fetchUser,[
    body("images","You must add minimum 1 image to your post!").isArray({min: 1, max: 5})
], async (req,res)=> {
    let success = false;
    const {images,caption} = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

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

        let post = await Post.findById(postId);
        if(!post) {
            success = false;
            return res.json({success, error: "Post not found!", status: 404});
        }
        
        post = await Post.findByIdAndUpdate(postId,{images: images, caption: caption}, {new: true});

        const posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

        success = true;
        return res.json({success, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-4: Delete a post using DELETE "/api/posts/deletepost:postId". Login required.
router.delete("/deletepost/:postId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let post = await Post.findById(postId);
        if(!post) {
            success = false;
            return res.json({success, error: "Post not found!", status: 404});
        }
        
        user = await User.findByIdAndUpdate(userId,{$pull: {posts: postId}},{new: true});
        let comments = await Comment.deleteMany({post: postId});
        post = await Post.findByIdAndDelete(postId,{new: true});

        const posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

        success = true;
        return res.json({success, user, posts, comments, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-5: Like a post using PUT "/api/posts/likepost/:postId". Login required.
router.put("/likepost/:postId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let post = await Post.findById(postId);
        if(!post) {
            success = false;
            return res.json({success, error: "Post not found!", status: 404});
        }
        
        post = await Post.findByIdAndUpdate(postId,{$push: {likes: user}},{new: true});

        const posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

        success = true;
        return res.json({success, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

// ROUTE-6: Unlike a post using PUT "/api/posts/unlikepost/:postId". Login required.
router.put("/unlikepost/:postId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let post = await Post.findById(postId);
        if(!post) {
            success = false;
            return res.json({success, error: "Post not found!", status: 404});
        }
        
        post = await Post.findByIdAndUpdate(postId,{$pull: {likes: userId}},{new: true});

        const posts = await Post.find()
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user")
            .populate("createdAt");

        success = true;
        return res.json({success, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

module.exports = router;