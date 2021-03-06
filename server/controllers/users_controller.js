const User = require('../models/user');
const jwt = require('jwt-simple');
const authConfig = require('../config/auth');
const Movie = require('../models/movie');
const send = require('./email_controller');
const Subscription = require('../models/subscriptions');
const Proposal = require('../models/proposal');

function generateToken(user) {
    const timestamp = new Date().getTime();
    console.log(user._id);
    return jwt.encode({ sub: user._id, iat: timestamp }, authConfig.secret);
}

function setUserInfo(request) {
    return {
        _id: request._id,
        email: request.email,
        role: request.role,
        username: request.username
    };
}

function unsubscribe(arr, id) {
    const index = arr.indexOf(id);
    arr.splice(index, 1);
}

module.exports = {
    greeting(req, res) {
        var obj = { greeting: 'Hi there' };
        res.render('index', obj);
    },

    signin(req, res, next) {
        const userInfo = setUserInfo(req.user);
        User.findOne({ _id: userInfo._id }).then((user) => {
            if (user.verified) {
                res.send({
                    token: generateToken(userInfo),
                    user: userInfo
                })
            } else {
                res.status(403).send({ error: 'Did you validated your account ?' })
            }
        })

    },

    signup(req, res, next) {
        const { email, password, role, username } = req.body;

        if (!email || !password) {
            return res.status(422).send({ error: 'You must provide an email and password' })
        }

        User.findOne({ email: email })
            .then((err, existingUser) => {
                if (err) { return next(err) }
                if (existingUser) {
                    return res.status(422).send({ error: 'Email is in use' });
                }
            });

        User.findOne({ username: username }).then((err, existingUser) => {
            if (err) { return next(err) }
            if (existingUser) {
                return res.status(422).send({ error: 'Username is in use' });
            }
        });


        const user = new User({
            email: email,
            password: password,
            role: role,
            username: username
        });

        user.save(function(err, user) {
            if (err) { return next(err) }

            const userInfo = setUserInfo(user);
            send.sendEmail(req, res, next, userInfo)
            res.json({
                token: generateToken(user),
                user: userInfo
            });
        }).catch(err => res.json(err))
    },

    editUser(req, res, next) {
        const { id } = req.params;
        const updates = req.body;
        console.log(updates)
        User.findOne({ _id: id })
            .then(user => {
                // workaround in order to change password
                // cf : https://stackoverflow.com/questions/26871720/using-findone-then-save-to-replace-a-document-mongoose
                for (var id in req.body) {
                    user[id] = updates[id];
                }
                user.save()
                res.json(user)
            });
    },

    removeUser(req, res, next) {
        const { id } = req.params;
        Subscription.find({ enrolled: { '_id': id } }).then((subs) => {
            const legacy = subs.map((sub) => sub._id);
            Movie.update({}, { $pull: { volunteers: { $in: legacy } } }, { multi: true }).then(() => {
                Subscription.remove({
                    enrolled: { '_id': id }
                }).then(() => {
                    Proposal.remove({ submitter: { _id: id } }).then(() => {
                        User.findByIdAndRemove({ _id: id })
                            .then(() => {
                                User.find({})
                                    .then(users => {
                                        res.json(users)
                                    });
                            })
                    })

                });
            });
        });
        /*
         */
    },



    getUsers(req, res, next) {
        User.find({})
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers'
                }
            })
            .then(users => {
                res.json(users)
            });
    },

    getUser(req, res, next) {
        const { id } = req.params;
        User.findOne({ _id: id })
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers',
                    model: 'user'
                }
            })
            .then(user => {
                res.json(user)
            });
    },



    subscribe(req, res, next) {

        const { userId, movieId } = req.body;
        const checkSubs = Movie.findOne({ _id: movieId }).then(res => {
            const { volunteers } = res;
            return volunteers.indexOf(userId) === -1;
        });
        const getMovie = Movie.findOne({ _id: movieId });
        const getUser = User.findOne({ _id: userId });


        Promise.all([getMovie, getUser, checkSubs])
            .then(results => {
                const movie = results[0];
                const user = results[1];
                const check = results[2];

                const { subscriptions } = user
                const { volunteers } = movie;
                if (check) {
                    subscriptions.push(movie);
                    volunteers.push(user);
                    return Promise.all([user.save(), movie.save()]);
                } else {
                    unsubscribe(subscriptions, movie._id);
                    unsubscribe(volunteers, movie._id);
                    return Promise.all([user.save(), movie.save()]);
                }
            })
            .then(() => getUser)
            .then(user => {
                return res.json(user);
            }).catch(err => {
                return res.status(500).send(err);
            });
    },

    roleAuthorization(roles) {
        return function(req, res, next) {
            const user = req.user;
            User.findById(user._id, function(err, foundUser) {
                if (err) {
                    res.status(422).json({ error: 'No user found.' });
                    return next(err);
                }

                if (roles.indexOf(foundUser.role) > -1) {
                    return next();
                }

                res.status(401).json({ error: 'You are not authorize to view this content.' });
                return next('Unauthorized');
            });
        };
    }
};