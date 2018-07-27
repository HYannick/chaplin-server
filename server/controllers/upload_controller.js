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
  async deletePreviews(req, res) {
    deleteImgSet(req.body, () => res.json({success: 'file s deleted'}))
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