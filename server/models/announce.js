const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AnnounceSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    date: String
});
const Announce = mongoose.model('announce', AnnounceSchema);





module.exports = Announce;