const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubscriptionSchema = new Schema({
    date: String,
    userId: Schema.ObjectId,
    movieId: Schema.ObjectId,
});

const Subscription = mongoose.model('subs', SubscriptionSchema);

module.exports = Subscription;