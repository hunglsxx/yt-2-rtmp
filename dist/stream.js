"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
const { spawn, spawnSync } = require('node:child_process');
class Stream {
    constructor(options) {
        this.input = options.input;
        this.output = options.output;
        this.ffmpegPath = options.ffmpegPath || 'ffmpeg';
        this.loop = options.loop || -1;
    }
    start(options) {
        let params = [
            '-reconnect', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '5',
            '-re',
            '-stream_loop', `${this.loop}`,
            '-i', this.input
        ];
        if (options && options.length)
            params = params.concat(options);
        params = params.concat([
            '-f', 'flv',
            '-flvflags', 'no_duration_filesize',
            this.output
        ]);
        this._spawn(this.ffmpegPath, params);
    }
    dispose() {
        let disposed = spawnSync('sh', [
            '-c',
            `ps aux | grep '[f]fmpeg.*${this.output}' | awk '$8=="T+" {print $2}' | xargs kill -9`
        ], { encoding: 'utf8' });
        console.log("Disposed stream", disposed);
        return disposed;
    }
    stop() {
        this.pause();
        this.dispose();
    }
    pause() {
        let paused = spawnSync('sh', [
            '-c',
            `ps aux | grep '[f]fmpeg.*${this.output}' | awk '{print $2}' | xargs -I {} kill -s SIGSTOP {}`
        ], { encoding: 'utf8' });
        console.log("Paused stream", paused);
        return paused;
    }
    async resume() {
        console.log("Sorry, currently resume function is not support");
    }
    _spawn(command, args) {
        const process = spawn(command, args);
        process.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        process.on('close', (code) => {
            console.log(`Child process exited with code ${code}`);
        });
    }
}
exports.Stream = Stream;
