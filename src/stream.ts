const { spawn, spawnSync } = require('node:child_process');

export interface StreamConfig {
    input: string;
    output: string;
    ffmpegPath?: string;
    loop?: number;
}

export class Stream {
    public input: string;
    public output: string;
    public ffmpegPath: string;
    public loop: number;

    constructor(options: StreamConfig) {
        this.input = options.input;
        this.output = options.output;
        this.ffmpegPath = options.ffmpegPath || 'ffmpeg';
        this.loop = options.loop || -1;
    }

    public start(options?: Array<string>) {
        let params = [
            '-reconnect', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '5',
            '-re',
            '-stream_loop', `${this.loop}`,
            '-i', this.input,
            '-c:a', 'aac',
            '-b:a', '128k', 
            '-ar', '44100', 
            '-c:v', 'libx264',
            '-b:v', '1500k',
            '-preset', 'veryfast'
        ];

        if (options && options.length) params = params.concat(options);

        params = params.concat([
            '-f', 'flv',
            '-flvflags', 'no_duration_filesize',
            this.output
        ]);

        this._spawn(this.ffmpegPath, params);

    }

    public dispose() {
        let disposed = spawnSync('sh', [
            '-c',
            `ps aux | grep '[f]fmpeg.*${this.output}' | awk '$8=="T+" {print $2}' | xargs kill -9`
        ], { encoding: 'utf8' });

        console.log("Disposed stream", disposed);
        return disposed;
    }

    public stop() {
        this.pause();
        this.dispose();
    }

    public pause() {
        let paused = spawnSync('sh', [
            '-c',
            `ps aux | grep '[f]fmpeg.*${this.output}' | awk '{print $2}' | xargs -I {} kill -s SIGSTOP {}`
        ], { encoding: 'utf8' });

        console.log("Paused stream", paused);
        return paused;
    }

    public async resume() {
        console.log("Sorry, currently resume function is not support");
    }

    private _spawn(command: string, args: Array<string>) {

        const process = spawn(command, args);

        process.stdout.on('data', (data: any) => {
            console.log(`stdout: ${data}`);
        });

        process.stderr.on('data', (data: any) => {
            console.error(`stderr: ${data}`);
        });

        process.on('close', (code: any) => {
            console.log(`Child process exited with code ${code}`);
        });
    }
}