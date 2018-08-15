const s3Client = require('./src/s3/client')
const s3Config = require('./config-s3.json');


const express = require('express');
const app = express();

app.use(express.static('client'));

app.get('/list', function (req, res) {
    console.log('receive query', req.query)
    const {date, max, color, method} = req.query;
    return s3Client.listObjects({
        bucketName: s3Config.bucketName,
        prefix: date,
        size: max
    }).then(data => {
        console.log('total from s3', data.length);
        if (color){
            data = data.filter(item => item.color === color);
        }
        if (method){
            data = data.filter(item => item.decodeMethod === method)
        }
        res.send(data);
        console.log('total after filter', data.length);
    });
});

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});

require('launch-browser')('http://localhost:3000/index.html')