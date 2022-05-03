const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'post'
        }
    ],
    messages: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            msg: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'message'
                }
            ]
        }
    ],
    profilepic: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    }
});

const User = mongoose.model('user', UserSchema);
module.exports = User;