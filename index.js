const app = require('./server/app');
const port = process.env.PORT || 4001;
const io = require('socket.io')(app.listen(port, () => {
    console.log('Running on port :: ', port);
}))
const chat = require('./server/controllers/chat_controller');
chat.initCon(io)