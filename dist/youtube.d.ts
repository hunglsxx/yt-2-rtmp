import YTDlpWrap from 'yt-dlp-wrap';
import { Stream } from './stream';
export interface YoutubeConfig {
    keyword: string;
    messages?: Array<string>;
    ytdlpPath?: string;
}
export interface ExtractConfig {
    videoQuanlity: string;
}
export interface LivestreamConfig {
    rtmp: string;
    loop?: number;
    draw?: string;
    ffmpegPath?: string;
}
export declare class Youtube {
    keyword: string;
    messages: Array<string>;
    videoId: string;
    videoTitle: string;
    videoDuration: number;
    videoChannelTitle: string;
    videoThumbnail: any;
    videoIsLive: boolean;
    videoDownloadUrl: string;
    ytDlp: YTDlpWrap;
    stream: Stream | undefined;
    constructor(options: YoutubeConfig);
    private _convertTimeToSeconds;
    extract(options?: ExtractConfig): Promise<void>;
    startStream(options: LivestreamConfig): void;
    stopStream(): void;
    pauseStream(): void;
    disposeStream(): void;
    resumeStream(): void;
    findOne(): Promise<any>;
    find(limit: number): Promise<any>;
}
