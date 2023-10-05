export interface StreamConfig {
    input: string;
    output: string;
    ffmpegPath?: string;
    loop?: number;
}
export declare class Stream {
    input: string;
    output: string;
    ffmpegPath: string;
    loop: number;
    constructor(options: StreamConfig);
    start(options?: Array<string>): void;
    dispose(): any;
    stop(): void;
    pause(): any;
    resume(): void;
    kill(): void;
    private _spawn;
}
