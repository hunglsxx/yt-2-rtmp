const youtubesearchapi = require('youtube-search-api');
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

export class Youtube {
    public keyword: string;
    public messages: Array<string>;

    public videoId: string = "";
    public videoTitle: string = "";
    public videoDuration: number = 0;
    public videoChannelTitle: string = "";
    public videoThumbnail: any = [];
    public videoIsLive: boolean = false;
    public videoDownloadUrl: string = "";
    public ytDlp: YTDlpWrap;

    public stream:Stream | undefined;

    constructor(options: YoutubeConfig) {
        this.keyword = options.keyword || "";
        this.messages = options.messages || [];
        this.ytDlp = new YTDlpWrap(options.ytdlpPath);
    }

    private _convertTimeToSeconds(time: string) {
        try {
            const timeArray = time.split(':').map(Number);

            let totalSeconds = 0;
            for (let i = timeArray.length - 1; i >= 0; i--) {
                totalSeconds += timeArray[i] * Math.pow(60, timeArray.length - 1 - i);
            }

            return totalSeconds;
        } catch (error) {
            return 0;
        }
    }

    public async extract(options?: ExtractConfig) {
        try {
            let item = (await youtubesearchapi
                .GetListByKeyword(this.keyword, false, 1, [{ type: "video" }]))
                .items[0];

            this.videoId = item.id;
            this.videoTitle = item.title;
            this.videoDuration = this._convertTimeToSeconds(item.length.simpleText);
            this.videoChannelTitle = item.channelTitle;
            this.videoThumbnail = item.thumbnail;
            this.videoIsLive = item.isLive;

            this.videoDownloadUrl = await this.ytDlp.execPromise([
                `${this.videoId}`,
                '-g',
                '-f',
                `${options?.videoQuanlity || 'best'}`
            ]);
        } catch (error) {

        }
    }

    public startStream(options: LivestreamConfig) {
        this.stream = new Stream({
            input: this.videoDownloadUrl,
            output: options.rtmp,
            loop: options.loop || -1,
            ffmpegPath: options.ffmpegPath || 'ffmpeg'
        });

        let pos: string = 'h/2';

        switch (options.draw) {
            case 'top':
                pos = '10';
                break;
            case 'bottom':
                pos = 'h-50';
                break;
            default:
                pos = 'h/2';
                break;
        }

        let params: Array<string> = [];

        if (this.messages && this.messages.length) {
            let message = this.messages.join(" | ");
            params = [
                '-vf',
                `drawtext=text='${message}':fontsize=32:fontcolor=white:x='if(gte(t,0), ((W+w)/10)*mod(t,10)-w, NAN)':y=${pos}`,
            ]
        }

        this.stream.start(params);
    }

    public stopStream() {
        this.stream?.stop()
    }

    public pauseStream() {
        this.stream?.pause();
    }

    public disposeStream() {
        this.stream?.dispose();
    }

    public resumeStream() {
        this.stream?.resume();
    }

    public async findOne() {
        try {
            return (await youtubesearchapi
                .GetListByKeyword(this.keyword, false, 1, [{ type: "video" }]))
                .items[0];
        } catch (error) {
            return null;
        }
    }


    public async find(limit: number) {
        try {
            return (await youtubesearchapi
                .GetListByKeyword(this.keyword, false, limit, [{ type: "video" }]))
                .items;
        } catch (error) {
            return null;
        }
    }
}