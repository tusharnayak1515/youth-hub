// This file will contain code that will manage all functionalities related to messages

const express = require('express');
const fetchUser = require('../middlewares/fetchUser');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// ROUTE-1: Fetch all messages using GET "/api/message/". Login required.
router.get("/",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        const messages = await Message.find()
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic")
            .sort("-createdAt");

        success = true;
        return res.json({success, messages, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

// ROUTE-2: Send message using POST "/api/message/:receiverId". Login required.
router.post("/:receiverId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const receiverId = req.params.receiverId;
    const {text,images} = req.body;
    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let receiver = await User.findById(receiverId);
        if(!receiver) {
            success = false;
            return res.json({success, error: "Reciever not found!", status: 404});
        }

        let mymessage = {
            sender: user,
            receiver: receiver
        };

        if(text) {
            mymessage.text = text;
        }

        if(images !== undefined && images.length !== 0) {
            mymessage.images = images;
        }

        let message = await Message.create(mymessage);

        const messages = await Message.find()
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic")
            .sort("-createdAt");

        success = true;
        return res.json({success, messages, message, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

module.exports = router;