const UserController = require('../controllers/users_controller');
const MovieController = require('../controllers/movie_controller');
const SubscriptionController = require('../controllers/subscription_controller');

const fs = require('fs');
const path = require('path');

const passport = require('passport');
const passportService = require('../config/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });
const isProd = process.env.NODE_ENV === 'production';

const Client = require('ftp');
const ftpOptions = {
    host: 'ftp.cluster020.hosting.ovh.net',
    user: 'ayhofrzkyz',
    password: 'aFSxhvAr7gp3',
    port: '21'
};
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './server/uploads')
    },
    filename: function(req, file, cb) {
        console.log(file.mimetype)
        console.log(file.originalname)
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, file.originalname);
        }

    }
});

module.exports = (app) => {
    app.get('/api', UserController.greeting);

    app.post('/api/signin', requireSignin, UserController.signin);
    app.post('/api/signup', UserController.signup);

    app.get('/api/users', requireAuth, UserController.getUsers);
    app.get('/api/users/:id', requireAuth, UserController.getUser);
    app.put('/api/users/:id', requireAuth, UserController.editUser);
    app.delete('/api/users/:id', requireAuth, UserController.removeUser);
    //app.post('/api/subscribe', requireAuth, UserController.subscribe);


    //TODO
    ///* requireAuth, UserController.roleAuthorization(['moderator']),*/
    app.get('/api/movies', MovieController.getMovies);
    app.get('/api/movies/popular', MovieController.getDiffusedMovies);
    app.get('/api/movies/upcoming', MovieController.getUpcomingMovies);
    app.get('/api/movies/:id', MovieController.getMovie);
    app.post('/api/movies/create', requireAuth, MovieController.createMovie);
    app.put('/api/movies/:id', requireAuth, MovieController.updateMovie);
    app.delete('/api/movies/:id', requireAuth, MovieController.deleteMovie);

    const uploadToFTP = (filename, res, obj) => {
        const c = new Client();
        c.connect(ftpOptions);
        c.on('ready', function() {
            c.list(function(err, list) {
                c.put(path.join('./server/uploads/', filename), `./www/uploads/${filename}`, function(err) {
                    console.log('done');
                    if (err) throw err;
                    c.end();
                    res.json(obj);
                });
            });
        });
    }
    app.post('/api/upload/cover', multer({ storage }).array('cover'), function(req, res) {
        const { filename } = req.files[0];
        obj = { 'cover': req.files };
        (isProd) ? uploadToFTP(filename, res, obj): res.json(obj);

    });

    app.post('/api/upload/images', multer({ storage }).array('images'), function(req, res) {
        const { filename } = req.files[0];
        obj = { 'images': req.files };
        (isProd) ? uploadToFTP(filename, res, obj): res.json(obj);
    });


    app.get('/api/uploads/:id', function(req, res) {
        if (req.params.id != 'undefined') {
            fs.createReadStream(path.join('./server/uploads/', req.params.id)).on('error', function(e) {
                console.log('errori', e);
                fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
            }).pipe(res);
        }
    });

    app.get('/api/subscriptions', SubscriptionController.getSubscriptions);
    app.get('/api/movie/:id/subscription?', SubscriptionController.getMovieSubscription);
    app.get('/api/movie/:id/subscriptions', SubscriptionController.getMovieSubscriptions);
    app.get('/api/user/:id/subscriptions', SubscriptionController.getUserSubscriptions);
    app.post('/api/subscribe', SubscriptionController.subscribe);
    app.delete('/api/subscribe/:id', SubscriptionController.unsubscribe);


};