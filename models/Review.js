const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
   comment: {
       type: String,
       required: true
   },
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

const Review = mongoose.model('review', ReviewSchema);
module.exports = Review;