const s3Client = require('./src/s3/client')
const s3Config = require('./config-s3.json');
const dbClient = require('./src/db/client.js');

const express = require('express');
const app = express();
const moment = require('moment');

app.use(express.static('client'));

app.get('/list', (req, res) => {
    console.log('receive query', req.query)
    const { startTime, endTime, max, color, method } = req.query;
    return dbClient.searchCaptchas(req.query).then(data => {
        console.log('total from db', data.length);
        res.send(data);
        console.log('total after filter', data.length);
    });
});

app.get('/syncdata', (req, res) => {
    const defaultStartDate = '2018-08-10';
    const getNeedSyncDays = lastModifiedDate => {
        const today = moment().dayOfYear();
        let lastModifi = lastModifiedDate.dayOfYear();
        let daysArray = [];
        while (lastModifi <= today) {
            daysArray.push(lastModifiedDate.format('YYYYMMDD'))
            lastModifiedDate = lastModifiedDate.add(1,'day');
            lastModifi++; 
        }
        return daysArray;
    };

    return dbClient.getLastSycnTime().then(data => {
        const lastModifiedTime = moment(data && data[0] && data[0].lastModifiedTime || defaultStartDate);
        const needSyncdDays = getNeedSyncDays(lastModifiedTime);
        console.log('---needSyncdDays---', needSyncdDays);
        return Promise.all(needSyncdDays.map(prefix => {
            console.log('---start processing ---', prefix);
            return s3Client.listObjects({
                bucketName: s3Config.bucketName,
                prefix: prefix,
                size: 1000
            }).then(dbClient.saveCaptchas).then(savedSize => ({
                day: prefix,
                count: savedSize
            }))
        })).then(results => {
            console.log('---success sycn---', results);
            res.send(results);
        })
    })
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});

require('launch-browser')('http://localhost:3000/index.html')