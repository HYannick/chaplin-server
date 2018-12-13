const AWS = require('aws-sdk')
const uuid = require('uuid/v1')
const {s3_keys, s3_bucket} = require('../config/upload_urls');

const s3 = new AWS.S3(s3_keys)

AWS.S3.prototype.getSignedUrlPromise = function (operation, params) {
  return new Promise((resolve, reject) => {
    this.getSignedUrl(operation, params, (err, url) => {
      err ? reject(err) : resolve(url)
    })
  })
}

function deleteImgSet(imgSet, cb) {
  if(!imgSet) {
    return cb();
  }
  const params = {
    Bucket: s3_bucket,
    Delete: {
      Objects: imgSet.map(img => ({Key: img})),
      Quiet: false
    }
  };
  s3.deleteObjects(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else return cb();
  });
}

const uploadProcess = {
  deleteImgSet(imgSet, cb) {
    const params = {
      Bucket: s3_bucket,
      Delete: {
        Objects: imgSet.map(img => ({Key: img})),
        Quiet: false
      }
    };
    s3.deleteObjects(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else return cb();
    });
  },
  async deletePreviews(req, res) {
    if(req.body.length) {
      deleteImgSet(req.body, () => res.json({success: 'files deleted'}))
    }
    res.json({success: 'No files to delete'})
  },
  async getSignedUrl(req, res) {
    const key = `${uuid()}.jpg`
    const signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: s3_bucket,
      ContentType: 'image/jpeg',
      Key: key
    })
    res.json({key, signedUrl})
  },
};

module.exports = uploadProcess;
