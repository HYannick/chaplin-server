const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MailingListSchema = new Schema({
    codes: Array,
});
const MailingList = mongoose.model('mailinglist', MailingListSchema);





module.exports = ChatMsg;