const s3Config = require('../../config-s3.json');

const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config-s3.json');

const bucketName = s3Config.bucketName;

const s3 = new AWS.S3();

const listObjects = params => {
    return listObjectsKeys(params).then(keys => {
        return Promise.all(keys.map(key => {
            return s3.getObject({
                Bucket: params.bucketName,
                Key: key
            }).promise().then(data => JSON.parse(data.Body.toString()));
        }))
    });
};

const listObjectsKeys = params => {
    return s3.listObjects({
        Bucket: params.bucketName,
        Prefix: params.prefix,
        MaxKeys: params.size
    }).promise().then(data => data.Contents.map(item => item.Key));
};


module.exports = {
    listObjects
}