'use strict';
const {AudioCapture, LevelMeter} = require('./index.js');

var meter = new LevelMeter();
meter.on('level', (data) => {
    console.log(data);
});

var capture = new AudioCapture({
    device: "default:CARD=AudioPCI",
    channels: 8,
    sampleRate: 48000
});

capture.on('sample', (data) => {
    switch(data.channel)
    {
        case 0:
            meter.addSample(data.value);
            break;
    }
});

capture.start();