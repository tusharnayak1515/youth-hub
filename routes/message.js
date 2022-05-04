// This file will contain code that will manage all functionalities related to messages

const express = require('express');
const fetchUser = require('../middlewares/fetchUser');
const Message = require('../models/Message');

const router = express.Router();

// ROUTE-1: Fetch all messages using GET "/api/message/". Login required.
router.get("/",fetchUser, async (req,res)=> {
    let success = false;
    try {
        const messages = await Message.find()
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic");

        success = true;
        return res.json({success, messages, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

// ROUTE-2: Add message using POST "/api/message/:receiverId". Login required.
router.get("/:receiverId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const receiverId = req.params.receiverId;
    try {
        const messages = await Message.find()
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic");

        success = true;
        return res.json({success, messages, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

module.exports = router;