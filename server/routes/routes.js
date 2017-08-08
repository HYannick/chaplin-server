const UserController = require('../controllers/users_controller');
const MovieController = require('../controllers/movie_controller');
const SubscriptionController = require('../controllers/subscription_controller');
const uploadController = require('../controllers/upload_controller');

const fs = require('fs');
const path = require('path');
const Jimp = require("jimp");
const passport = require('passport');
const passportService = require('../config/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });
const isProd = process.env.NODE_ENV === 'production';
const apiUrls = require('../config/apiUrls');
const multer = require('multer');

const nodemailer = require('nodemailer');


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

function processImages(req, res, obj, rendering) {
    const { filename } = req.files[0];
    Jimp.read(path.join(`${apiUrls.uploads}/` + filename)).then(function(image) {
        image
            .quality(rendering) // set JPEG quality
            .write(path.join(`${apiUrls.uploads}/` + filename)); // save
        (isProd) ? uploadController.uploadToFTP(filename, res, obj): res.json(obj);
    }).catch(function(err) {
        console.error(err);
    });
}

module.exports = (app) => {
    app.get('/api', UserController.greeting);

    app.post('/api/signin', requireSignin, UserController.signin);
    app.post('/api/signup', UserController.signup);

    app.get('/api/users', requireAuth, UserController.getUsers);
    app.get('/api/users/:id', requireAuth, UserController.getUser);
    app.put('/api/users/:id/edit', requireAuth, UserController.editUser);
    app.delete('/api/users/:id', UserController.removeUser);

    //TODO
    ///* requireAuth, UserController.roleAuthorization(['moderator']),*/
    app.get('/api/movies', MovieController.getMovies);
    app.get('/api/movies/popular', MovieController.getDiffusedMovies);
    app.get('/api/movies/upcoming', MovieController.getUpcomingMovies);
    app.get('/api/movies/:id', MovieController.getMovie);
    app.post('/api/movies/create', requireAuth, MovieController.createMovie);

    app.get('/api/proposals', MovieController.getProposal);
    app.post('/api/proposals', requireAuth, MovieController.postProposal);
    app.delete('/api/proposals/:id', requireAuth, MovieController.deleteProposal);
    app.put('/api/proposals/:id', MovieController.likeProposal);

    app.put('/api/movies/:id', requireAuth, MovieController.updateMovie);
    app.delete('/api/movies/:id', requireAuth, MovieController.deleteMovie);

    app.post('/api/upload/cover', multer({ storage }).array('cover'), function(req, res) {
        const obj = { 'cover': req.files }
        processImages(req, res, obj, 60)


    });

    app.get('/api/subscriptions', SubscriptionController.getSubscriptions);
    app.get('/api/movie/:id/subscription?', SubscriptionController.getMovieSubscription);
    app.get('/api/movie/:id/subscriptions', SubscriptionController.getMovieSubscriptions);
    app.get('/api/user/:id/subscriptions', SubscriptionController.getUserSubscriptions);
    app.post('/api/subscribe', SubscriptionController.subscribe);
    app.delete('/api/subscribe/:id', SubscriptionController.unsubscribe);


    const xoauth2 = require('xoauth2')
    var transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 465,
        secure: true,
        auth: {

            type: 'Oauth2',
            user: 'qu0rragun@gmail.com',
            clientId: '915104744507-43se8cbpu5937ea1k50gj2l3cn0iaogr.apps.googleusercontent.com',
            clientSecret: '4zVzCj3nIgDPaSVAJmkx6QxR',
            refreshToken: '1/MK0O5V-bXHUr7dmCcpvCFMNHjvsVwmiL9-8i7OL3En8'

        }
    });

    const mailOptions = {
            from: 'qu0rragun@gmail.com',
            //to: 'yoshimath@gmail.com',
            subject: 'Gngn',
            html: 'Je t\'aime <3!'
        }
        //Upload part
    app.get('/api/sendmail', function(req, res, next) {
        /*transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                res.json({ success: 'successfully sent!' })
            }
        });*/
    });

    app.post('/api/upload/images', multer({ storage }).array('images'), function(req, res) {
        const obj = { 'images': req.files }
        processImages(req, res, obj, 80)
    });

    app.delete('/api/uploads/:id', function(req, res, next) {
        const { id } = req.params;
        if (isProd) {
            uploadController.deleteFromFTP(res, id);
        } else {
            fs.unlink(path.join(`${apiUrls.uploads}/`, id), function(err) {
                if (err) throw err;
                res.json({ success: 'file deleted' });
            });
        }
    });


    app.get('/api/uploads/:id', function(req, res) {
        if (req.params.id != 'undefined') {
            fs.createReadStream(path.join(`${apiUrls.uploads}/`, req.params.id)).on('error', function(e) {
                console.log('error', e);
                fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
            }).pipe(res);
        }
    });
};