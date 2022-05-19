const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
    images:[
        {
            type: String,
            required: true
        }
    ],
    caption: {
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comment'
        }
    ],
    createdAt: Number,
    updatedAt: Number
},{timestamps: true});

const Post = mongoose.model('post', PostSchema);
module.exports = Post;