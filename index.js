const s3Client = require('./src/s3/client')
const s3Config = require('./config-s3.json');

const params = {
    bucketName: s3Config.bucketName,
    prefix: '20180815',
    size: 10000
}

s3Client.listObjects(params).then(data => {
    console.log('---data---', data.length);
});