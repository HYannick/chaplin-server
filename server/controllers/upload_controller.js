const fs = require('fs');
const Client = require('ftp');
const Cloudinary = require('cloudinary');
const path = require('path');
const ftpOptions = require('../config/ftp');
const apiUrls = require('../config/upload_urls');
const multer = require('multer');
const Jimp = require("jimp");
const isProd = process.env.NODE_ENV === 'production';

Cloudinary.config({
  cloud_name: 'ayho-society',
  api_key: '387412896244547',
  api_secret: '4Vvzfyeq1Y7TF8lNeZA8bN7jvwc'
});


const uploadProcess = {

  processImages(req, res, obj, rendering) {
    const {filename} = req.files[0];
    Jimp.read(path.join(`${apiUrls.uploads}/` + filename)).then(function (image) {
      image
        .quality(rendering) // set JPEG quality
        .write(path.join(`${apiUrls.uploads}/` + filename)); // save
      (isProd) ? uploadProcess.uploadToFTP(filename, res, obj) : res.json(obj);
    }).catch(function (err) {
      console.error(err);
    });
  },

  uploadToFTP(filename, res, obj) {
    Cloudinary.v2.uploader.upload(path.join(`${apiUrls.uploads}/`, filename), function (err, result) {
      if (err) {
        res.status(503).json({error: 'Failed to upload :('})
      }
      console.log(result)
      fs.readdir(apiUrls.uploads, function (req, files) {
        if (files.length > 10) {
          fs.unlink(path.join(`${apiUrls.uploads}/`, filename), function (err) {
            if (err) throw err;
            res.json(result);
          });
        } else {
          res.json(result);
        }
      })
    });
  },

  deleteFromFTP(res, filename) {
    Cloudinary.v2.uploader.destroy(`${apiUrls.ftp}/${filename}`, function(err, result) {
      if (err) {
        res.status(503).json({error: 'deleted'})
      }

      fs.readdir(apiUrls.uploads, function (req, files) {
        if (files.indexOf(filename) !== -1) {
          fs.unlink(path.join(`${apiUrls.uploads}/`, filename), function (err) {
            if (err) throw err;
            res.json({success: 'file deleted'});
          });
        } else {
          res.json({success: 'file deleted'});
        }
      });
    })
  },

  uploadPDF(req, res) {
    const obj = {'pdf': req.files}
    const {filename} = req.files[0];
    console.log(filename)
    if (isProd) {
      const c = new Client();
      c.connect(ftpOptions);
      c.on('ready', function () {
        c.list(function (err, list) {
          c.put(path.join(`${apiUrls.uploadPDF}/`, filename), `${apiUrls.ftpPDF}/${filename}`, function (err) {
            console.log('done');
            if (err) throw err;
            c.end();
            fs.readdir(apiUrls.uploadPDF, function (req, files) {
              files.forEach(file => {
                fs.unlink(path.join(`${apiUrls.uploadPDF}/`, file), function (err) {
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
    const obj = {'cover': req.files}
    uploadProcess.processImages(req, res, obj, 60)
  },

  uploadImageSet(req, res) {
    const obj = {'images': req.files}
    uploadProcess.processImages(req, res, obj, 80)
  },

  deleteImages(req, res, next) {
    const {id} = req.params;
    console.log('deleting')
    if (isProd) {
      uploadProcess.deleteFromFTP(res, id);
    } else {
      fs.unlink(path.join(`${apiUrls.uploads}/`, id), function (err) {
        if (err) throw err;
        res.json({success: 'file deleted'});
      });
    }
  },

  //this is a tricky one...XD
  // CF : https://stackoverflow.com/questions/14295878/delete-several-files-in-node-js
  deleteFromRequest(files, callback) {
    var i = files.length;
    files.forEach(function (filepath) {
      if (filepath) {
        if (isProd) {
          const c = new Client();
          c.connect(ftpOptions);
          c.on('ready', function () {
            c.list(function (err, list) {
              c.delete(`${apiUrls.ftp}/${filepath}`, function (err) {
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
          fs.unlink(path.join(`${apiUrls.uploads}/`, filepath), function (err) {
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
      fs.createReadStream(path.join(`${apiUrls.uploads}/`, req.params.id)).on('error', function (e) {
        console.log('error', e);
        fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
      }).pipe(res);
    }
  },
  viewPDF(req, res) {
    fs.createReadStream(`${apiUrls.uploadPDF}/programme.pdf`).on('error', function (e) {
      console.log('error', e);
      fs.createReadStream(path.join('./server/static/404.png')).pipe(res)
    }).pipe(res);
  }
};

module.exports = uploadProcess;