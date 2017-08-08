const Subscription = require('../models/subscriptions');
const Movie = require('../models/movie');
const User = require('../models/user');
module.exports = {
    getSubscriptions(req, res, next) {
        Subscription.find({})
            .populate({
                path: 'movies',
                model: 'movie'
            })
            .populate({
                path: 'enrolled',
                model: 'user'
            })
            .then((err, subs) => {
                if (err) { res.send(err) }
                res.json(subs);
            });
    },
    getMovieSubscriptions(req, res, next) {
        const { id } = req.params;
        Subscription.find({
                movies: { '_id': id },
            })
            .populate({
                path: 'enrolled',
                model: 'user'
            })
            .then((err, sub) => {
                if (err) { res.send(err) }
                res.json(sub);
            });
    },
    getMovieSubscription(req, res, next) {
        const { id } = req.params;
        const { date, time } = req.query;
        Subscription.find({
                movies: { '_id': id },
                date: date,
                time: time
            })
            .populate({
                path: 'enrolled',
                model: 'user'
            })
            .then((err, sub) => {
                if (err) { res.send(err) }
                res.json(sub);
            });
    },
    getUserSubscriptions(req, res, next) {
        const { id } = req.params;
        Subscription.find({
                enrolled: { '_id': id }
            })
            .populate({
                path: 'movies',
                model: 'movie'
            })
            .then((err, sub) => {
                if (err) { res.send(err) }
                res.json(sub);
            });
    },
    subscribe(req, res, next) {

        const { date, time, userId, movieId } = req.body;

        const getMovie = Movie.find({ _id: movieId })
        const getUser = User.find({ '_id': userId });
        const getSubscriptions = Subscription.find({});


        Promise.all([getMovie, getUser])
            .then(results => {
                const movie = results[0];
                const user = results[1];

                const { enrolled } = user[0];
                const { volunteers } = movie[0];

                Subscription.find({
                    time: time,
                    date: date,
                    movies: { '_id': movieId }
                }).then(sub => {

                    if (sub.length === 0) {
                        Subscription.create({
                            date,
                            time,
                            movies: movieId,
                            enrolled: userId
                        }).then(sub => {
                            enrolled.push(sub);
                            volunteers.push(sub);
                            return Promise.all([user[0].save(), movie[0].save()])
                        })
                    } else {
                        const isEnrolled = sub[0].enrolled;
                        if (isEnrolled.length !== 0) {
                            if (isEnrolled.indexOf(userId) !== -1) {
                                Subscription.remove({ '_id': sub[0]._id }).then(() => {
                                    enrolled.splice(enrolled.indexOf(sub[0]._id), 1);
                                    volunteers.splice(volunteers.indexOf(sub[0]._id), 1);
                                    return Promise.all([user[0].save(), movie[0].save()])
                                })
                            } else {
                                return res.status(500).send({ error: 'Someone already subscribed at this time. Too late!' });
                            }
                        }
                    }
                });
            })
            .then(() => getSubscriptions)
            .then(subs => {
                return res.json(subs);
            }).catch(err => {
                return res.status(500).send(err);
            });
    },
    unsubscribe(req, res, next) {
        Subscription.remove({
                _id: req.params.id
            })
            .then(() => Subscription.find({})
                .then((subs) => {

                    res.json(subs);
                }));
    }
}