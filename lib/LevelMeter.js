"use strict";
const { EventEmitter } = require('events');

class LevelMeter extends EventEmitter
{
    constructor(config = {})
    {
        super();

        const defaults = {
            windowSize: 4096,
            wordLength: 16
        };

        this.config = {...defaults, ...config};

        this.maxSample = 0;
        this.sampleCount = 0;
        this.levelPercentage = 0;
        this.levelDecibels = -Infinity;
        this.dynamicRange = 60;     // decibels (noise floor)

        this.levelDivider = 32767;  // 16bit signed
        if (this.config.wordLength == 32) this.levelDivider = 2147483647;   // 32bit signed
    }

    addSample(s)
    {
        this.maxSample = Math.max(this.maxSample, Math.abs(s));
        this.sampleCount++;

        if (this.sampleCount == this.config.windowSize)
        {
            this.levelDecibels = (20 * Math.log10(this.maxSample / this.levelDivider));
            //this.level = (20 * Math.log10(this.maxSample)); // float
            if (this.levelDecibels < (-this.dynamicRange)) this.levelDecibels = -Infinity;             // -60dB floor
            this.levelPercentage = 100 - ((this.levelDecibels / (-this.dynamicRange)) * 100);    // output a percentage
            if (this.levelPercentage < 0) this.levelPercentage = 0;

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