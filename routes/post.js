// This file will contain code that will manage all functionalities related to posts

const express = require('express');
const fetchUser = require('../middlewares/fetchUser');
const Post = require('../models/Post');

const router = express.Router();

router.get("/posts",fetchUser, async (req,res)=> {
    let success = true;
    try {
        let posts = await Post.find();
        success = true;
        return res.json({success, posts, status: 200});
    } catch (error) {
        success = false;
        return res.json({success, error: error.message, status: 500});
    }
})

module.exports = router;