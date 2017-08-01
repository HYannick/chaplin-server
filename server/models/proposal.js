const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProposalSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    cover: String,
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

const Proposal = mongoose.model('proposals', ProposalSchema);
module.exports = Proposal;