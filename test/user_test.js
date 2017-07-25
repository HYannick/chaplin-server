const assert = require('assert');
//const User = require('../server/models/user');
const app = require('./app');
const request = require('supertest');
const mongoose = require('mongoose');
const User = mongoose.model('user');
describe('Creating users', () => {
    it('POST request create a user', (done) => {
        User.count().then(count => {
            request(app)
                .post('/api/signup')
                .send({
                    email: 'sansa@stark.com',
                    password: 'mozilla'
                })
                .end(() => {
                    User.count().then(newCount => {
                        assert(newCount === 1);
                        done();
                    })
                })


        })
    });

    it('PUT request update user', (done) => {
        const arya = new User({email:'arya@stark.com', password: 'nodok#1'});
        arya.save()
            .then(() => {
                request(app)
                    .put(`/api/users/${arya._id}`)
                    .send({username: 'arya stark'})
                    .end(() => {
                        User.findOne({_id: arya._id})
                            .then(user => {
                                assert(user.username === 'arya stark');
                                done();
                            })
                    })
            })
    });

    it('DELETE request delete current user', (done) => {
        const arya = new User({email:'arya@stark.com', password: 'nodok#1'});
        arya.save()
            .then(() => {
                request(app)
                    .delete(`/api/users/${arya._id}`)
                    .end(() => {
                        User.findOne({_id: arya._id})
                            .then((user) => {
                                console.log(user);
                                assert(user === null);
                                done();
                            })
                    })
            });
    })
});