// This file will contain code that will manage all functionalities related to messages

const express = require('express');
const fetchUser = require('../middlewares/fetchUser');
const Conversation = require('../models/Conversation');
const Coversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// ROUTE-1: Fetch all messages using GET "/api/message/". Login required.
router.get("/msg/:senderId/:receiverId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const receiverId = req.params.receiverId;
    const senderId = req.params.senderId;
    // console.log("senderid: ",senderId);
    // console.log("receiverid: ",receiverId);
    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        if(receiverId === senderId) {
            success = false;
            return res.json({success, error: "You cannot send message to yourself!", status: 400});
        }

        const messages = await Message.find({$or: [{$and: [{sender: senderId}, {receiver: receiverId}]},{$and: [{sender: receiverId}, {receiver: senderId}]}] })
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic");

        success = true;
        return res.json({success, messages, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

// ROUTE-2: Fetch all converstations using GET "/api/message/conversations". Login required.
router.get("/conversations",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        const conversations = await Conversation.find()
            .populate("recipients", "_id name username profilepic")
            .sort("-updatedAt");

        success = true;
        return res.json({success, conversations, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

// ROUTE-3: Send message using POST "/api/message/:receiverId". Login required.
router.post("/:senderId/:receiverId",fetchUser, async (req,res)=> {
    let success = false;
    const userId = req.user.id;
    const receiverId = req.params.receiverId;
    const senderId = req.params.senderId;
    const {text,images} = req.body;
    console.log("senderid: ",senderId);
    console.log("receiverid: ",receiverId);
    try {
        let user = await User.findById(userId);
        if(!user) {
            success = false;
            return res.json({success, error: "User not found!", status: 404});
        }

        let sender = await User.findById(senderId);
        if(!sender) {
            success = false;
            return res.json({success, error: "Sender not found!", status: 404});
        }

        let receiver = await User.findById(receiverId);
        if(!receiver) {
            success = false;
            return res.json({success, error: "Reciever not found!", status: 404});
        }

        if(text === undefined && images === undefined) {
            success = false;
            return res.json({success, error: "You cannot send a message without text or images!", status: 400});
        }

        if(senderId === receiverId) {
            success = false;
            return res.json({success, error: "You cannot send message to yourself!", status: 400});
        }

        const newConversation = await Coversation.findOneAndUpdate(
            {
                $or: [
                    {recipients: [sender._id, receiver._id]},
                    {recipients: [receiver._id, sender._id]}
                ]
            },
            {
                recipients: [sender._id, receiver._id],
                text,
                images
            },
            {new: true, upsert: true}
        );

        let mymessage = {
            conversation: newConversation._id,
            sender: sender._id,
            receiver: receiver._id
        };

        if(text) {
            mymessage.text = text;
        }

        if(images !== undefined && images.length !== 0) {
            mymessage.images = images;
        }

        let message = await Message.create(mymessage);

        message = await Message.findById(message._id)
            .populate("conversation", "recipients")
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic")
            .sort("-createdAt");

        const messages = await Message.find()
            .populate("sender", "_id name username profilepic")
            .populate("receiver", "_id name username profilepic");
            // .sort("-createdAt");

        success = true;
        return res.json({success, messages, message, status: 200});
    } catch (error) {
        success = false;
        return res.json({success,error: error.message, status: 500})
    }
});

module.exports = router;