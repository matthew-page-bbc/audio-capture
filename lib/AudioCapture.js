'use strict';
const debug = require('debug')('AudioCapture');
const spawn = require('child_process').spawn;
const { EventEmitter } = require('events');

class AudioCapture extends EventEmitter {
    constructor(config = {}) {
        super();

        let defaults = {
            device: "plughw:0",
            channels: 2,
            sampleRate: 48000,
            wordLength: 16
        }

        this.config = {...defaults, ...config};
        this.recorder = null;
        this.currentChannel = 0;

        // public variables
        this.isCapturing = false;
    }

    start() {
        let {device, channels, sampleRate, wordLength} = this.config;
        const frameSize = wordLength == 16 ? 2 : 4;

        // start the arecord (ALSA) process
        this.recorder = spawn('arecord', [
            '-D', device,
            '-c', channels,
            '-r', sampleRate,
            '-f', wordLength == 16 ? 'S16_LE' : 'S32_LE',
            '-t', 'raw',
            '-v']);

        this.isCapturing = true;

        this.recorder.stdout.on('data', (data) => {
            debug('arecord: data received ' + data.length + ' bytes.');

            for (let b = 0; b < (data.length - (frameSize - 1)); b += frameSize) {

                let sample;
                if (wordLength == 16) {
                    sample = data.readInt16LE(b);
                }
                else {
                    sample = data.readInt32LE(b);
                }

                this.emit('sample', {channel: this.currentChannel, value: sample});

                this.currentChannel++;
                if (this.currentChannel == channels) this.currentChannel = 0;
            }
        });

        this.recorder.stderr.on('data', (data) => {
            debug('arecord: ' + data);
        });

        this.recorder.on('error', (err) => {
            debug('arecord error: ', err);
            this.isCapturing = false;
        });

        this.recorder.on('exit', (code) => {
            debug('arecord: exit code ', code);
            this.isCapturing = false;
        });
    }

    stop() {
        this.recorder.kill();
        this.isCapturing = false;
    }
}

module.exports = AudioCapture;