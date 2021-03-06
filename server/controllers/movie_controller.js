const Movie = require('../models/movie');
const User = require('../models/user');
const Proposal = require('../models/proposal');
const Subscription = require('../models/subscriptions');
const uploadCtrl = require('./upload_controller');
const moment = require('moment');
const scrap = require('scrap');
const _ = require('lodash');

const sortMovies = (movies, limit, res, isDiffused) => {
  const now = moment().unix();
  const mapped = movies.filter(movie => {
    return isDiffused ? movie.diffused = true : movie;
  }).map(movie => {
    return movie.dates;
  });

  const filtered = [].concat(...mapped).filter(item => {
    return moment(item.fullDate).unix() >= now;
  }).map(item => {
    const date = moment(item.fullDate).unix();
    const {time} = item;
    const data = movies.filter(movie => {
      return movie.dates.indexOf(item) !== -1;
    }).map(({title, _id, cover, desc, imageSet, dates, information, disclaimer}) => {
      return {title, _id, cover, imageSet, desc, dates, date, time, information, disclaimer}
    });

    //sort dates
    data[0].dates = _.sortBy(data[0].dates, ['date'])

    return data[0]
  });

  const defaultList = _.uniqBy(_.sortBy(filtered, ['date']), '_id');
  const movieList = _.uniqBy(_.sortBy(filtered, ['date']), '_id').slice(0, parseInt(limit));

  if (movieList.length === defaultList.length) {
    res.json({movieList, max: true});
  } else {
    res.json({movieList, max: false});
  }
};
module.exports = {
  getMovie(req, res, next) {
    const {id} = req.params;
    Movie.findOne({_id: id})
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
    const {title} = req.query;
    Movie.find({$text: {$search: title}})
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
        if (err) {
          res.send(err);
        }
        res.json(movies);
      });
  },

  getDiffusedMovies(req, res, next) {
    const {limit} = req.query;

    Movie.find({'diffused': true})
      .then((movies) => {
        sortMovies(movies, limit, res, true)
      });
  },
  getUpcomingMovies(req, res, next) {
    const {limit} = req.query;
    Movie.find({'upcoming': true})
      .then((movies) => {
        sortMovies(movies, limit, res, false)
      });
  },
  getRelatedMovies(req, res, next) {
    const now = moment().unix();
    const {genre} = req.query;
    const {id} = req.params;
    const genres = genre[0].split(',')
    const sliced = genres.slice(0, 2)
    Movie.find({'genres': {$in: sliced}, 'diffused': true})
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
  getFilteredMovies(req, res, next) {
    const queryString = req.query;
    const {genres, diffused, upcoming, language} = req.query;
    const genresList = genres[0].split(',')
    const obj = {
      genres: {$in: genresList},
      diffused,
      upcoming,
      language
    }
    const query = _.reduce(obj, (result, value, key) => {
      if (value) {
        result[key] = value;
        return result;
      }
    }, {})


    Movie.find(query).then(movies => {
      res.json({movies: _.orderBy(movies, ['title'])});
    })
  },
  deleteMovie(req, res, next) {
    const {id} = req.params;
    Subscription.find({movies: {'_id': id}})
      .then((subs) => {
        const legacy = subs.map((sub) => sub._id);
        User.update({}, {$pull: {enrolled: {$in: legacy}}}, {multi: true}).then(() => {
          Subscription.remove({
            movies: {'_id': id}
          }).then(() => {
            Movie.findOne({'_id': id}).then(async movie => {
              movie.imageSet.push(movie.cover)
              uploadCtrl.deleteImgSet(movie.imageSet, () => {
                Movie.remove({_id: req.params.id})
                .then(() => Movie.find({})
                  .then(movies => res.json(movies)))
              })
            })

          })
        })
      });
  },
  updateMovie(req, res, next) {
    const movieId = req.params.id;
    const movieProps = req.body;
    Movie.update({_id: movieId}, movieProps)
      .then(() => {
        Subscription.find({movies: {'_id': movieId}})
          .then((subs) => {
            const formatDate = movieProps.dates.map(date => {
              return moment(date.fullDate).unix().toString()
            })
            const filterSub = subs.filter(sub => {
              return formatDate.indexOf(sub.date) === -1;
            }).map(sub => sub.date)
            Subscription.remove({'date': {$in: filterSub}})
              .then(() => res.json({success: 'subs deleted'}))
          })
      })
  },

  getProposal(req, res, next) {
    Proposal.find({})
      .populate({
        path: 'submitter',
        model: 'user'
      })
      .populate({
        path: 'likes',
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
    const {id} = req.params;
    const {userId} = req.body;
    Proposal.findById({_id: id}).then(proposal => {
      const {likes} = proposal;
      if (likes.indexOf(userId) !== -1) {
        likes.splice(likes.indexOf(userId), 1);
      } else {
        likes.push(userId);
      }
      proposal.save().then(() => {
        Proposal.find({})
          .populate({
            path: 'submitter',
            model: 'user'
          })
          .populate({
            path: 'likes',
            model: 'user'
          })
          .then((proposals) => {
            res.json(proposals);
          }).catch(err => res.json(err));
      });
    });
  },
  deleteProposal(req, res, next) {
    Proposal.remove({
      _id: req.params.id
    })
      .then(() => Proposal.find({})
        .then((proposals) => {
          res.json(proposals);
        }));
  },
  getScrapbookedContent(req, res, next) {
    scrap(req.body, function (err, $) {
      if (err) {
        throw err;
      }
      const container = $('.movie-card-overview');

      function pushDatas($elem, isActors) {
        const arr = [];
        _.forEach($elem, (item) => {
          arr.push($(item).text())
        });
        if (isActors) arr.pop()
        return arr;
      }
      res.json({
        title: $('.titlebar-title-lg').text().trim(),
        duration: container.find('.meta-body .meta-body-item').eq(0).clone().remove('span').text().trim().replace(/[{()}]/g, ''),
        releaseDate: container.find('.date').text().trim(),
        genres: pushDatas(container.find('.meta-body .meta-body-item').eq(3).find('.blue-link')),
        authors: pushDatas(container.find('.meta-body .meta-body-item').eq(1).find('.blue-link')),
        actors: pushDatas(container.find('.meta-body .meta-body-item').eq(2).find('.blue-link'), true),
        language: container.find('.nationality').text().trim(),
        synopsis: $('#synopsis-details .content-txt').text().trim()
      });
    });

  }
};
