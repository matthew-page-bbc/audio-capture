"use strict";
const EventEmitter = require('events');

class LevelMeter extends EventEmitter
{
    constructor(windowSize = 4096)
    {
        super();

        this.windowSize = windowSize;
        this.maxSample = 0;
        this.sampleCount = 0;
        this.levelPercentage = 0;
        this.levelDecibels = -Infinity;
        this.dynamicRange = 60;     // decibels (noise floor)
    }

    addSample(s)
    {
        this.maxSample = Math.max(this.maxSample, Math.abs(s));
        this.sampleCount++;

        if (this.sampleCount == this.windowSize)
        {
            this.levelDecibels = (20 * Math.log10(this.maxSample / 2147483647));    // 32bit signed sample
            //this.level = (20 * Math.log10(this.maxSample)); // float
            if (this.levelDecibels < (-this.dynamicRange)) this.levelDecibels = -Infinity;             // -60dB floor
            this.levelPercentage = 100 - ((this.levelDecibels / (-this.dynamicRange)) * 100);    // output a percentage

            this.emit('level', {
                decibels: this.levelDecibels.toFixed(2),
                percentage: Math.round(this.levelPercentage)
            });

            this.maxSample = 0;
            this.sampleCount = 0;
        }
    }
}

module.exports = LevelMeter;