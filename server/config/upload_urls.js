module.exports = {
  uploads: './server/uploads',
  uploadPDF: './server/uploads/pdf',
  s3_keys: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    signatureVersion: process.env.SIGNATURE_VERSION,
    region: process.env.S3_REGION
  },
  s3_bucket: process.env.S3_BUCKET,
}