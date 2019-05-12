'use strict';
const AudioCapture = require('./index.js');

var capture = new AudioCapture({channels: 8});

capture.on('sample', (data) => {
    console.log(data);
});

capture.start();