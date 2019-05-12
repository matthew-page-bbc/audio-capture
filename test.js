'use strict';
const AudioCapture = require('./index.js');

var capture = new AudioCapture({
    device: "default:CARD=AudioPCI",
    channels: 8,
    sampleRate: 48000
});

capture.on('sample', (data) => {
    console.log(data);
});

capture.start();