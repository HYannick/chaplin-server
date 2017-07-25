const Subscription = require('../models/subscriptions');
const Movie = require('../models/movie');
const User = require('../models/user');
module.exports = {
    getSubscriptions(req, res, next) {
        Subscription.find({})
            .then((err, subs) => {
                if (err) { res.send(err) }
                res.json(subs);
            });
    },
    subscribe(req, res, next) {
        const { movieId, userId } = req.body;
        const getMovie = Movie.findOne({ _id: movieId });
        const getUser = User.findOne({ _id: userId });

        Subscription.create(req.body)
            .then(() => Subscription.find({})
                .then((err, subs) => {
                    if (err) { res.send(err) }
                    res.json(subs);
                }));
    },
    unsubscribe(req, res, next) {
        Subscription.remove({
                _id: req.params.id
            })
            .then(() => Subscription.find({})
                .then((err, subs) => {
                    if (err) { res.send(err) }
                    res.json(subs);
                }));
    }
}