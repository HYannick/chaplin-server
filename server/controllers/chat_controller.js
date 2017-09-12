const ChatMsg = require('../models/chatmsg');

module.exports = {
    initCon(io) {
        {
            console.log('init')
            var numUsers = 0;
            io.on('connection', function(socket) {
                var addedUser = false;
                // when the client emits 'new message', this listens and executes
                socket.on('login', function(data) {
                    // we tell the client to execute 'new message'
                    console.log(`${data} is connected.`)

                    ChatMsg.find({})
                        .then((msg) => {
                            socket.emit('getMessages', msg)
                        })
                });

                socket.on('getMessages', function() {
                    ChatMsg.find({})
                        .then((msg) => {
                            socket.emit('getMessages', msg)
                        })
                });

                // when the client emits 'new message', this listens and executes
                socket.on('chat', function(data) {
                    // we tell the client to execute 'new message'
                    const { author, message, date } = data;

                    socket.broadcast.emit('response', {
                        author,
                        message,
                        date
                    });
                    ChatMsg.create(data)
                        .then(() => {
                            ChatMsg.find({})
                                .then((msg) => {
                                    socket.emit('getMessages', msg)
                                })
                        });
                });

                // when the client emits 'add user', this listens and executes
                socket.on('add user', function(username) {
                    if (addedUser) return;

                    // we store the username in the socket session for this client
                    socket.username = username;
                    ++numUsers;
                    addedUser = true;
                    socket.emit('login', {
                        numUsers: numUsers
                    });
                    // echo globally (all clients) that a person has connected
                    socket.broadcast.emit('user joined', {
                        username: socket.username,
                        numUsers: numUsers
                    });
                });

                // when the client emits 'typing', we broadcast it to others
                socket.on('typing', function() {
                    socket.broadcast.emit('typing', {
                        username: socket.username
                    });
                });

                // when the client emits 'stop typing', we broadcast it to others
                socket.on('stop typing', function() {
                    socket.broadcast.emit('stop typing', {
                        username: socket.username
                    });
                });

                // when the user disconnects.. perform this
                socket.on('disconnect', function() {
                    if (addedUser) {
                        --numUsers;

                        // echo globally that this client has left
                        socket.broadcast.emit('user left', {
                            username: socket.username,
                            numUsers: numUsers
                        });
                    }
                });
            });
        }
    },
    getMessages(req, res, next) {
        ChatMsg.find({})
            .then((msg) => {
                res.json(msg)
            })
    }
}