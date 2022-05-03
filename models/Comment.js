const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema({
   comment: {
       type: String,
       required: true
   },
   likes: [
       {
           type: Schema.Types.ObjectId,
           ref: 'user'
       }
   ],
   post: {
       type: Schema.Types.ObjectId,
       ref: 'post'
   },
   user: {
       type: Schema.Types.ObjectId,
       ref: 'user'
   },
   createdAt: Number,
   updatedAt: Number
});

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;