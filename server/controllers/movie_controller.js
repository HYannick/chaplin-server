const Movie = require('../models/movie');
const Proposal = require('../models/proposal');
const multer = require('multer');

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
            .then((err, movies) => {
                if (err) { res.send(err) }
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
            .then((err, movies) => {
                if (err) { res.send(err) }
                res.json(movies);
            });
    },
    createMovie(req, res, next) {
        Movie.create(req.body)
            .then(() => Movie.find({})
                .then((err, movies) => {
                    if (err) { res.send(err) }
                    res.json(movies);
                }));
    },
    deleteMovie(req, res, next) {
        Movie.remove({
                _id: req.params.id
            })
            .then(() => Movie.find({})
                .then((err, movies) => {
                    if (err) { res.send(err) }
                    res.json(movies);
                }));
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