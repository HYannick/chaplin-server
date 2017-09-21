const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MailingListSchema = new Schema({
    code: Number,
    email: String
});
const MailingList = mongoose.model('mailinglist', MailingListSchema);

module.exports = MailingList;