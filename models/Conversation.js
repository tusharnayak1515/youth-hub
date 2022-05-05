const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new Schema(
    {
        recipients: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
        text: String,
        media: Array,
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model('conversation', ConversationSchema);
module.exports = Conversation;