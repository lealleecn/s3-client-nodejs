const s3Config = require('../../config-s3.json');

const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config-s3.json');

const bucketName = s3Config.bucketName;

const s3 = new AWS.S3();

const listObjects = params => {
    return listObjectsKeys(params).then(keys => {
        return Promise.all(keys.map(key => {
            // console.log('s3 getting by key ', key);
            return s3.getObject({
                Bucket: params.bucketName,
                Key: key
            }).promise().then(data => {
                let item = JSON.parse(data.Body.toString());
                item.id = data.ETag.replace(/"/g, '');
                item.key = key;
                item.lastModifiedTime = data.LastModified;
                return item;
            });
        }))
    });
};

const listObjectsKeys = (params, initKeys = []) => {
    console.log('s3 list object keys with params:', params);
    return s3.listObjectsV2({
        Bucket: params.bucketName,
        Prefix: params.prefix,
        MaxKeys: params.size,
        ContinuationToken: params.continuationToken
    }).promise().then(data => {
        const currentRoundKeys = data.Contents.map(item => item.Key);
        if (data.IsTruncated) {
            params.continuationToken = data.NextContinuationToken;
            return listObjectsKeys(params, initKeys.concat(currentRoundKeys));
        }
        return initKeys.concat(currentRoundKeys);
    });
};


module.exports = {
    listObjects
}