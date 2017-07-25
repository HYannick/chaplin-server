const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

before((done) => {
    mongoose.connect('mongodb://localhost/chap_test');
    mongoose.connection
        .once('open', () => {done();})
        .on('error', (error) => {
            console.warn('Warnin', error);
        });
});

beforeEach((done) => {
    const {users, movies } = mongoose.connection.collections;
    users.drop(() => {
        movies.drop(() => {
            done()
        })
    })
});