const fs = require('fs');
const Client = require('ftp');
const path = require('path');
const ftpOptions = require('../config/ftp');
const apiUrls = require('../config/upload_urls');
const multer = require('multer');
const Jimp = require("jimp");
const isProd = process.env.NODE_ENV === 'production';

const uploadProcess = {

    processImages(req, res, obj, rendering) {
        const { filename } = req.files[0];
        Jimp.read(path.join(`${apiUrls.uploads}/` + filename)).then(function(image) {
            image
                .quality(rendering) // set JPEG quality
                .write(path.join(`${apiUrls.uploads}/` + filename)); // save
            (isProd) ? uploadProcess.uploadToFTP(filename, res, obj): res.json(obj);
        }).catch(function(err) {
            console.error(err);
        });
    },

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
                        } else {
                            res.json({ success: 'file deleted' });
                        }
                    });
                });
            });
        });
    },

    uploadPDF(req, res) {
        const obj = { 'pdf': req.files }
        const { filename } = req.files[0];
        console.log(filename)
        if (isProd) {
            const c = new Client();
            c.connect(ftpOptions);
            c.on('ready', function() {
                c.list(function(err, list) {
                    c.put(path.join(`${apiUrls.uploadPDF}/`, filename), `${apiUrls.ftpPDF}/${filename}`, function(err) {
                        console.log('done');
                        if (err) throw err;
                        c.end();
                        fs.readdir(apiUrls.uploadPDF, function(req, files) {
                            files.forEach(file => {
                                fs.unlink(path.join(`${apiUrls.uploadPDF}/`, file), function(err) {
                                    if (err) throw err;
                                    res.json(obj);
                                });
                            });
                        });
                    });
                });
            });
        } else {
            res.json(obj)
        }
    },
    uploadCover(req, res) {
        const obj = { 'cover': req.files }
        uploadProcess.processImages(req, res, obj, 60)
    },

    uploadImageSet(req, res) {
        const obj = { 'images': req.files }
        uploadProcess.processImages(req, res, obj, 80)
    },

    deleteImages(req, res, next) {
        const { id } = req.params;
        console.log('deleting')
        if (isProd) {
            uploadProcess.deleteFromFTP(res, id);
        } else {
            fs.unlink(path.join(`${apiUrls.uploads}/`, id), function(err) {
                if (err) throw err;
                res.json({ success: 'file deleted' });
            });
        }
    },

    //this is a tricky one...XD
    // CF : https://stackoverflow.com/questions/14295878/delete-several-files-in-node-js
    deleteFromRequest(files, callback) {
        var i = files.length;
        files.forEach(function(filepath) {
            if (filepath) {
                if (isProd) {
                    const c = new Client();
                    c.connect(ftpOptions);
                    c.on('ready', function() {
                        c.list(function(err, list) {
                            c.delete(`${apiUrls.ftp}/${filepath}`, function(err) {
                                console.log('deleted');
                                i--;
                                c.end();
                                if (err) {
                                    callback(err);
                                    return;
                                } else if (i <= 0) {
                                    callback(null);
                                }
                            });
                        });
                    });
                } else {
                    fs.unlink(path.join(`${apiUrls.uploads}/`, filepath), function(err) {
                        i--;
                        if (err) {
                            callback(err);
                            return;
                        } else if (i <= 0) {
                            callback(null);
                        }
                    });
                }
            } else {
                callback(null);
            }

        });
    },

    viewImage(req, res) {
        if (req.params.id != 'undefined') {
            fs.createReadStream(path.join(`${apiUrls.uploads}/`, req.params.id)).on('error', function(e) {
                console.log('error', e);
                fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
            }).pipe(res);
        }
    },
    viewPDF(req, res) {
        fs.createReadStream(`${apiUrls.uploadPDF}/programme.pdf`).on('error', function(e) {
            console.log('error', e);
            fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
        }).pipe(res);
    }
};

module.exports = uploadProcess;