'use strict';
const {AudioCapture, LevelMeter} = require('./index.js');

var meter = new LevelMeter({
    wordLength: 16
});
meter.on('level', (data) => {
    console.log(data);
});

var capture = new AudioCapture({
    device: "plughw:1",
    channels: 8,
    sampleRate: 48000,
    wordLength: 16
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