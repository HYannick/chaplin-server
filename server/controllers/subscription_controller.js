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
        console.log(id)
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
        console.log(date, time);
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
        const { enrolled, movies, time, date } = req.body;
        Subscription.find({
                time: time,
                date: date,
                movies: { '_id': movies }
            })
            .then((sub) => {
                if (sub.length === 0) {
                    Subscription.create(req.body)
                        .then(() => Subscription.find({})
                            .then((subs) => {
                                res.json(subs);
                            })).catch(err => res.status(500).send(err));
                } else {
                    const isEnrolled = sub[0].enrolled;
                    if (isEnrolled.length !== 0) {
                        if (isEnrolled.indexOf(enrolled) !== -1) {
                            isEnrolled.splice(isEnrolled.indexOf(enrolled), 1);
                            sub[0].save().then(() => Subscription.find({})
                                .then(subs => res.json(subs)));
                        } else {
                            throw 'Someone already subscribed at this time. Too late!'
                        }

                    } else {
                        isEnrolled.push(enrolled);
                        sub[0].save().then(() => Subscription.find({})
                            .then(subs => res.json(subs)));
                    }
                }

            })
            .catch(err => {
                res.json({ err })
            })
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