// This file will contain code that will manage all functionalities related to reviews

const express = require('express');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middlewares/fetchUser');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

//ROUTE-1: Fetch all comments using GET "/api/reviews/". Login Required.
router.get("/",fetchUser,async (req,res)=> {
    let success = false;
    try {
        let comments = await Comment.find()
            .populate("user", "_id name username profilepic");

        success = true;
        return res.json({success, comments, status: 200})
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

//ROUTE-2: Add a comment using POST "/api/reviews/addreview". Login Required.
router.post("/addcomment/:postId",fetchUser,[
    body("comment","You cannot post an empty comment").replace(/\s/g,'').trim().isLength({min:1})
],async (req,res)=> {
    let success = false;
    const {comment} = req.body;
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
            return res.json({success, error: "User not found", status: 404});
        }

        let post = await Post.findById(postId);
        if(!post) {
            success = false;
            return res.json({success, error: "Post not found", status: 404});
        }

        let mycomment = await Comment.create({
            comment: comment,
            post: post,
            user: user
        });

        const comments = await Comment.find()
            .populate("user", "_id name username profilepic");

        post = await Post.findByIdAndUpdate(postId,{$push: {comments: mycomment}},{new: true})
            .populate("user", "_id name username profilepic")
            .populate("comments", "_id comment user");

        success = true;
        return res.json({success, post, comments, status: 200})
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
});

module.exports = router;