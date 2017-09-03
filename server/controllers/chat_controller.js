const ChatMsg = require('../models/chatmsg');

module.exports = {
    postMessage(req, res, next) {
        ChatMsg.create(req.body)
            .then(chatmsg => res.json(chatmsg))
    },
    getMessages(req, res, next) {
        ChatMsg.find({})
            .then((msg) => res.json(msg))
    }
}