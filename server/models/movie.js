const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MovieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    synopsis: String,
    cover: String,
    language: String,
    checkList: Array,
    duration: String,
    imageSet: Array,
    actors: Array,
    genres: Array,
    desc: String,
    dates: Array,
    releaseDate: String,
    upcoming: {
        type: Boolean,
        default: false
    },
    authors: Array,
    trailer: String,
    diffused: {
        type: Boolean,
        default: false
    },
    volunteers: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

const Movie = mongoose.model('movie', MovieSchema);

module.exports = Movie;