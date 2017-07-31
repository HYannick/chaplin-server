const Movie = require('../models/movie');
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
    createMovie(req, res, next) {
        const {
            title,
            synopsis,
            cover,
            language,
            checkList,
            imageSet,
            duration,
            actors,
            genres,
            desc,
            dates,
            authors,
            trailer,
            year,
        } = req.body;
        Movie.create({
                title,
                synopsis,
                cover,
                language,
                checkList,
                imageSet,
                duration,
                actors,
                genres,
                desc,
                dates,
                authors,
                trailer,
                year,
            })
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
    }
};