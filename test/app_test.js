const request = require('supertest');
const assert = require('assert');
const app = require('./app');

describe('The Express server', () => {
    it('handles a GET request to /api', (done) => {
        request(app)
            .get('/api')
            .end((err,res) => {
                assert(res.body.hi === 'there');
                done();
            })
    })
});