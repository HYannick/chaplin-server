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
    url: String,
    submitter: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

ProposalSchema.pre('save', function(next) {
    const proposal = this;

    if (proposal.isNew) {
        this.likes.push(this.submitter);
        next();
    } else {
        next();
    }

});
const Proposal = mongoose.model('proposals', ProposalSchema);
module.exports = Proposal;