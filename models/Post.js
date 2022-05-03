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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'review'
        }
    ],
    createdAt: Number,
    updatedAt: Number
});

const Post = mongoose.model('post', PostSchema);
module.exports = Post;