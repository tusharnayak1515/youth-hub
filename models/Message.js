const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: Number,
    updatedAt: Number
});

const Message = mongoose.model('message', MessageSchema);
module.exports = Message;