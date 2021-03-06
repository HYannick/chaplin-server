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
const AnnounceController = require('../controllers/announce_controller');
const ChatController = require('../controllers/chat_controller');


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
    app.get('/api/movies/search', MovieController.getMovieByTitle);
    app.get('/api/movies/popular', MovieController.getDiffusedMovies);
    app.get('/api/movies/upcoming', MovieController.getUpcomingMovies);
    app.get('/api/movies/:id/related', MovieController.getRelatedMovies);
    app.get('/api/movies/:id', MovieController.getMovie);
    app.post('/api/movies/create', requireAuth, MovieController.createMovie);
    app.put('/api/movies/:id', requireAuth, MovieController.updateMovie);
    app.delete('/api/movies/:id', requireAuth, MovieController.deleteMovie);
    app.get('/api/search', MovieController.getFilteredMovies);
    app.post('/api/scrapbooking', MovieController.getScrapbookedContent);

    // Proposals Control
    app.get('/api/proposals', MovieController.getProposal);
    app.post('/api/proposals', requireAuth, MovieController.postProposal);
    app.delete('/api/proposals/:id', requireAuth, MovieController.deleteProposal);
    app.put('/api/proposals/:id', MovieController.likeProposal);


    // Subscription Control
    app.get('/api/subscriptions', SubscriptionController.getSubscriptions);
    app.get('/api/movie/:id/subscription', SubscriptionController.getMovieSubscription);
    app.get('/api/movie/:id/subscriptions', SubscriptionController.getMovieSubscriptions);
    app.get('/api/user/:id/subscriptions', SubscriptionController.getUserSubscriptions);
    app.post('/api/subscribe', SubscriptionController.subscribe);
    app.delete('/api/subscribe/:id', SubscriptionController.unsubscribe);
    app.post('/api/subscriptions/delete', SubscriptionController.deleteSubscriptions);


    // Email Control
    app.post('/api/sendmail', EmailController.sendEmail);
    app.get('/api/sendmail/verify', EmailController.verifyEmail);


    // Upload Images Control
    app.get('/api/upload', requireAuth, uploadController.getSignedUrl);
    app.post('/api/upload/delete', requireAuth, uploadController.deletePreviews);

    // Announces
    app.get('/api/announce', AnnounceController.getAnnounce);
    app.post('/api/announce/create', AnnounceController.postAnnounce);
    app.delete('/api/announce/:id', AnnounceController.deleteAnnounce);
    app.put('/api/announce/:id', AnnounceController.updateAnnounce);

    // Announces
    app.get('/api/newsletter/emails', EmailController.getEmails);
    app.post('/api/newsletter/email/create', EmailController.addEmail);
    app.delete('/api/newsletter/email/:id', EmailController.RemoveEmail);

    // Chat
    app.get('/api/chat/messages', ChatController.getMessages);
};
