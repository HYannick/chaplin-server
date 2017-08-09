const fs = require('fs');
const path = require('path');
const multer = require('multer');

//Passport config
const passport = require('passport');
const passportService = require('../config/passport');
const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

//Controllers
const UserController = require('../controllers/users_controller');
const MovieController = require('../controllers/movie_controller');
const SubscriptionController = require('../controllers/subscription_controller');
const uploadController = require('../controllers/upload_controller');
const EmailController = require('../controllers/email_controller');

const apiUrls = require('../config/upload_urls');


// Multer Storage config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, apiUrls.uploads)
    },
    filename: function(req, file, cb) {
        console.log(file);
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, file.originalname);
        }
    }
});


module.exports = (app) => {
    //Welcome!
    app.get('/api', UserController.greeting);

    //Login Control
    app.post('/api/signin', requireSignin, UserController.signin);
    app.post('/api/signup', UserController.signup);

    // User Control
    app.get('/api/users', requireAuth, UserController.getUsers);
    app.get('/api/users/:id', requireAuth, UserController.getUser);
    app.put('/api/users/:id/edit', requireAuth, UserController.editUser);
    app.delete('/api/users/:id', UserController.removeUser);

    //TODO
    ///* requireAuth, UserController.roleAuthorization(['moderator']),*/

    // Movie Control
    app.get('/api/movies', MovieController.getMovies);
    app.get('/api/movies/popular', MovieController.getDiffusedMovies);
    app.get('/api/movies/upcoming', MovieController.getUpcomingMovies);
    app.get('/api/movies/:id', MovieController.getMovie);
    app.post('/api/movies/create', requireAuth, MovieController.createMovie);
    app.put('/api/movies/:id', requireAuth, MovieController.updateMovie);
    app.delete('/api/movies/:id', requireAuth, MovieController.deleteMovie);

    // Proposals Control
    app.get('/api/proposals', MovieController.getProposal);
    app.post('/api/proposals', requireAuth, MovieController.postProposal);
    app.delete('/api/proposals/:id', requireAuth, MovieController.deleteProposal);
    app.put('/api/proposals/:id', MovieController.likeProposal);


    // Subscription Control
    app.get('/api/subscriptions', SubscriptionController.getSubscriptions);
    app.get('/api/movie/:id/subscription?', SubscriptionController.getMovieSubscription);
    app.get('/api/movie/:id/subscriptions', SubscriptionController.getMovieSubscriptions);
    app.get('/api/user/:id/subscriptions', SubscriptionController.getUserSubscriptions);
    app.post('/api/subscribe', SubscriptionController.subscribe);
    app.delete('/api/subscribe/:id', SubscriptionController.unsubscribe);

    // Email Control
    app.post('/api/sendmail', EmailController.sendEmail);


    // Upload Images Control
    app.get('/api/uploads/:id', uploadController.viewImage);
    app.post('/api/upload/cover', multer({ storage }).array('cover'), uploadController.uploadCover);
    app.post('/api/upload/images', multer({ storage }).array('images'), uploadController.uploadImageSet);
    app.delete('/api/uploads/:id', uploadController.deleteImages);

};