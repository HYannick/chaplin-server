const Announce = require('../models/announce');

module.exports = {
    getAnnounce(req, res, next) {
        Announce.find({})
            .then(announce => res.json(announce))
    },
    postAnnounce(req, res, next) {
        Announce.update({}, req.body)
            .then(() => {
                res.json({ succss: 'updated' })
            })

    },
    deleteAnnounce(req, res, next) {
        const { id } = req.params;
        Announce.remove({ _id: id })
            .then(announce => res.json(announce))
    },
    updateAnnounce(req, res, next) {
        const { id } = req.params;
        Announce.update({ _id: movieId }, req.body)
            .then(announce => res.json(announce))
    }
}