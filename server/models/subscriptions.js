const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubscriptionSchema = new Schema({
    date: String,
    time: String,
    enrolled: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    movies: [{
        type: Schema.Types.ObjectId,
        ref: 'movie'
    }]
}, {usePushEach: true});

const Subscription = mongoose.model('subs', SubscriptionSchema);

module.exports = Subscription;