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

        const createSub = Subscription.create(req.body)
            .then(() => Subscription.find({})
                .then((subs) => {
                    console.log(subs)
                    res.json(subs);
                })).catch(err => res.status(500).send(err));



        Promise.all([getMovie, getUser, createSub])
            .then(results => {
                const movie = results[0];
                const user = results[1];
                const createSubs = results[2];

                const { enrolled } = user;
                const { volunteers } = movie;

                enrolled.push(movie);
                volunteers.push(user);
                return Promise.all([user.save(), movie.save()]);

            })
            .then(() => getUser)
            .then(user => {
                return res.json(user);
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