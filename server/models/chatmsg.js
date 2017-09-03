const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChatMsgSchema = new Schema({
    author: String,
    date: String,
    message: String,
});
const ChatMsg = mongoose.model('chatmsg', ChatMsgSchema);





module.exports = ChatMsg;