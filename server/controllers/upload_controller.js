const fs = require('fs');
const Client = require('ftp');
const path = require('path');
const apiUrls = require('../config/apiUrls');
const ftpOptions = {
    host: 'ftp.cluster020.hosting.ovh.net',
    user: 'ayhofrzkyz',
    password: 'aFSxhvAr7gp3',
    port: '21'
};
module.exports = {
    uploadToFTP(filename, res, obj) {
        const c = new Client();
        c.connect(ftpOptions);
        c.on('ready', function() {
            c.list(function(err, list) {
                c.put(path.join(`${apiUrls.uploads}/`, filename), `${apiUrls.ftp}/${filename}`, function(err) {
                    console.log('done');
                    if (err) throw err;
                    c.end();
                    fs.readdir(apiUrls.uploads, function(req, files) {
                        if (files.length > 10) {
                            fs.unlink(path.join(`${apiUrls.uploads}/`, filename), function(err) {
                                if (err) throw err;
                                res.json(obj);
                            });
                        } else {
                            res.json(obj);
                        }
                    })

                });
            });
        });
    },

    deleteFromFTP(res, filename) {
        const c = new Client();
        c.connect(ftpOptions);
        c.on('ready', function() {
            c.list(function(err, list) {
                c.delete(`${apiUrls.ftp}/${filename}`, function(err) {
                    console.log('deleted');
                    if (err) throw err;
                    c.end();
                    fs.readdir(apiUrls.uploads, function(req, files) {
                        if (files.indexOf(filename) !== -1) {
                            fs.unlink(path.join(`${apiUrls.uploads}/`, filename), function(err) {
                                if (err) throw err;
                                res.json({ success: 'file deleted' });
                            });
                        }
                    });
                });
            });
        });
    }
}