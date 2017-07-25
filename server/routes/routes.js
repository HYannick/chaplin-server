const UserController = require('../controllers/users_controller');
const MovieController = require('../controllers/movie_controller');
const uploadController = require('../controllers/upload_controller');

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
})
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const passportService = require('../config/passport');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = (app) => {
    app.get('/api', UserController.greeting);

    app.post('/api/signin', requireSignin, UserController.signin);
    app.post('/api/signup', UserController.signup);

    app.get('/api/users', requireAuth, UserController.getUsers);
    app.get('/api/users/:id', requireAuth, UserController.getUser);
    app.put('/api/users/:id', requireAuth, UserController.editUser);
    app.delete('/api/users/:id', requireAuth, UserController.removeUser);
    app.post('/api/subscribe', requireAuth, UserController.subscribe);



    app.get('/api/protected', requireAuth, function(req, res) {
        res.send({ authenticated: true });
    });

    //TODO
    ///* requireAuth, UserController.roleAuthorization(['moderator']),*/
    app.get('/api/movies', MovieController.getMovies);
    app.get('/api/movies/popular', MovieController.getDiffusedMovies);
    app.get('/api/movies/:id', MovieController.getMovie);
    app.post('/api/movies/create', requireAuth, MovieController.createMovie);
    app.put('/api/movies/:id', requireAuth, MovieController.updateMovie);
    app.delete('/api/movies/:id', requireAuth, MovieController.deleteMovie);



    app.del('/api/upload/del/:id', function(req, res) {
        const id = req.params.id;
        fs.unlink(path.join('./server/uploads/', id), function(error) {
            if (error) {
                throw error;
            }
            console.log('Deleted' + id);
        });
    });
    app.post('/api/upload/cover', multer({ storage }).array('cover'), function(req, res) {
        console.log(req.files);
        res.json({ 'cover': req.files });
    });

    app.post('/api/upload/images', multer({ storage }).array('images'), function(req, res) {
        console.log(req.files);
        res.json({ 'images': req.files });
    });


    app.get('/api/uploads/:id', function(req, res) {
        if (req.params.id != 'undefined') {
            fs.createReadStream(path.join('./server/uploads/', req.params.id)).on('error', function(e) {
                console.log('errori', e);
                fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
            }).pipe(res);
        }
    });

    /*app.get('/api/uploads/:id', function(req, res) {
        console.log(req.params);
        const storedMimeType = 'image/jpeg';
        res.setHeader('Content-Type', storedMimeType);
        if (req.params.id != 'undefined') {
            fs.createReadStream(path.join('./server/uploads/', req.params.id).replace(/\.[^/.]+$/, "")).pipe(res);
        }
    });*/
};