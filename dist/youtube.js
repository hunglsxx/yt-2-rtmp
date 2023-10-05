"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Youtube = void 0;
const youtubesearchapi = require('youtube-search-api');
const yt_dlp_wrap_1 = __importDefault(require("yt-dlp-wrap"));
const stream_1 = require("./stream");
class Youtube {
    constructor(options) {
        this.videoId = "";
        this.videoTitle = "";
        this.videoDuration = 0;
        this.videoChannelTitle = "";
        this.videoThumbnail = [];
        this.videoIsLive = false;
        this.videoDownloadUrl = "";
        this.keyword = options.keyword || "";
        this.messages = options.messages || [];
        this.ytDlp = new yt_dlp_wrap_1.default(options.ytdlpPath);
    }
    _convertTimeToSeconds(time) {
        try {
            const timeArray = time.split(':').map(Number);
            let totalSeconds = 0;
            for (let i = timeArray.length - 1; i >= 0; i--) {
                totalSeconds += timeArray[i] * Math.pow(60, timeArray.length - 1 - i);
            }
            return totalSeconds;
        }
        catch (error) {
            return 0;
        }
    }
    async extract(options) {
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
                `${(options === null || options === void 0 ? void 0 : options.videoQuanlity) || 'best'}`
            ]);
        }
        catch (error) {
        }
    }
    startStream(options) {
        this.stream = new stream_1.Stream({
            input: this.videoDownloadUrl,
            output: options.rtmp,
            loop: options.loop || -1
        });
        let pos = 'h/2';
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
        let params = [];
        if (this.messages && this.messages.length) {
            let message = this.messages.join(" | ");
            params = [
                '-vf',
                `drawtext=text='${message}':fontsize=32:fontcolor=white:x='if(gte(t,0), ((W+w)/10)*mod(t,10)-w, NAN)':y=${pos}`,
            ];
        }
        this.stream.start(params);
    }
    stopStream() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.stop();
    }
    pauseStream() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.pause();
    }
    disposeStream() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    resumeStream() {
        var _a;
        (_a = this.stream) === null || _a === void 0 ? void 0 : _a.resume();
    }
    async findOne() {
        try {
            return (await youtubesearchapi
                .GetListByKeyword(this.keyword, false, 1, [{ type: "video" }]))
                .items[0];
        }
        catch (error) {
            return null;
        }
    }
    async find(limit) {
        try {
            return (await youtubesearchapi
                .GetListByKeyword(this.keyword, false, limit, [{ type: "video" }]))
                .items;
        }
        catch (error) {
            return null;
        }
    }
}
exports.Youtube = Youtube;
