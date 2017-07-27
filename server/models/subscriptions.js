const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubscriptionSchema = new Schema({
    date: String,
    time: String,
    userId: Schema.ObjectId,
    movieId: [{
        type: Schema.Types.ObjectId,
        ref: 'movie'
    }]
});

const Subscription = mongoose.model('subs', SubscriptionSchema);

module.exports = Subscription;