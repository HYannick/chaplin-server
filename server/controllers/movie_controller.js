const Movie = require('../models/movie');
const User = require('../models/user');
const Proposal = require('../models/proposal');
const Subscription = require('../models/subscriptions');
const uploadCtrl = require('./upload_controller');

module.exports = {
    getMovie(req, res, next) {

        const { id } = req.params;

        Movie.findOne({ _id: id })
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers',
                    model: 'user'
                }
            })
            .then(movie => {
                res.json(movie);
            });
    },
    getMovieByTitle(req, res, next) {
        const { title } = req.query;
        console.log(title)
        Movie.find({ $text: { $search: title } })
            .then(movie => {
                res.json(movie);
            });
    },
    getMovies(req, res, next) {
        Movie.find({})
            .populate({
                path: 'volunteers',
                model: 'subs',
                populate: {
                    path: 'enrolled',
                    model: 'user'

                }
            })
            .then((err, movies) => {
                if (err) { res.send(err) }
                res.json(movies);
            });
    },
    getDiffusedMovies(req, res, next) {
        Movie.find({ 'diffused': true })
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers',
                    model: 'user'
                }
            })
            .then((movies) => {
                res.json(movies);
            });
    },
    getUpcomingMovies(req, res, next) {
        Movie.find({ 'upcoming': true })
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers',
                    model: 'user'
                }
            })
            .then((movies) => {
                res.json(movies);
            });
    },
    getRelatedMovies(req, res, next) {
        const { genre } = req.query;
        const { id } = req.params;
        const genres = genre[0].split(',')
        const sliced = genres.slice(0, 2)
        Movie.find({ 'genres': { $in: sliced } })
            .populate({
                path: 'subscriptions',
                populate: {
                    path: 'volunteers',
                    model: 'user'
                }
            })
            .then((movies) => {
                const filtered = movies.filter(movie => movie._id.toString() !== id)
                res.json(filtered);
            });
    },
    createMovie(req, res, next) {
        Movie.create(req.body)
            .then(() => Movie.find({})
                .then((movies) => {
                    res.json(movies);
                }));
    },
    deleteMovie(req, res, next) {
        const { id } = req.params;
        Subscription.find({ movies: { '_id': id } })
            .then((subs) => {
                legacy = subs.map((sub) => sub._id);
                User.update({}, { $pull: { enrolled: { $in: legacy } } }, { multi: true }).then(() => {
                    Subscription.remove({
                        movies: { '_id': id }
                    }).then(() => {
                        Movie.findOne({ '_id': id }).then(movie => {
                            movie.imageSet.push(movie.cover)
                            uploadCtrl.deleteFromRequest(movie.imageSet, function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    Movie.remove({
                                            _id: req.params.id
                                        })
                                        .then(() => res.json({ success: 'film deleted' }));
                                }
                            })
                        })

                    })
                })
            });
    },
    updateMovie(req, res, next) {
        const movieId = req.params.id;
        const movieProps = req.body;

        Movie.update({ _id: movieId }, movieProps)
            .then(() => Movie.find({})
                .then((err, movies) => {
                    if (err) { res.send(err) }
                    res.json(movies);
                }));
    },

    getProposal(req, res, next) {
        Proposal.find({})
            .populate({
                path: 'submitter',
                model: 'user'
            })
            .then((proposals) => {
                res.json(proposals);
            }).catch(err => res.json(err));
    },

    postProposal(req, res, next) {
        Proposal.create(req.body)
            .then(() => Proposal.find({})
                .then((err, proposals) => {
                    if (err) res.send(err)
                    res.json(proposals);
                }));
    },
    likeProposal(req, res, next) {
        const { id } = req.params;
        const { userId } = req.body;
        Proposal.findById({ _id: id }).then(proposal => {
            const { likes } = proposal;
            if (likes.indexOf(userId) !== -1) {
                likes.splice(likes.indexOf(userId), 1);
            } else {
                likes.push(userId);
            }
            proposal.save().then(() => res.json({ success: 'You liked it!' }));
        });
    },
    deleteProposal(req, res, next) {
        Proposal.remove({
                _id: req.params.id
            })
            .then(() => Proposal.find({})
                .then((err, proposals) => {
                    if (err) { res.send(err) }
                    res.json(proposals);
                }));
    },
};