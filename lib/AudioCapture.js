'use strict';
const debug = require('debug')('AudioCapture');
const spawn = require('child_process').spawn;
const EventEmitter = require('events');

class AudioCapture extends EventEmitter {
    constructor(options = {}) {
        super();
        // private variables
        this.device = options.device || "default:CARD=AudioPCI";
        this.channels = options.channels || 2;
        this.sampleRate = options.sampleRate || 48000;

        this.recorder = null;
        this.currentChannel = 0;

        // public variables
        this.isCapturing = false;
    }

    start() {
        // start the arecord (ALSA) process
        this.recorder = spawn('arecord', [
            '-D', this.device,
            '-c', this.channels,
            '-r', this.sampleRate,
            '-f', 'S32_LE',
            //'-f', 'FLOAT_LE',
            '-t', 'raw',
            '-v']);

        this.isCapturing = true;

        this.recorder.stdout.on('data', (data) => {
            debug('arecord: data received ' + data.length + ' bytes.');

            for (var b = 0; b < (data.length - 3); b += 4) {
                var sample = data.readInt32LE(b);
                //var sample = data.readFloatLE(b);

                this.emit('sample', {channel: this.currentChannel, value: sample});

                this.currentChannel++;
                if (this.currentChannel == this.channels) this.currentChannel = 0;
            }
        });

        this.recorder.stderr.on('data', (data) => {
            debug('arecord: ' + data);
        });

        this.recorder.on('error', (err) => {
            debug('Error: ', err);
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