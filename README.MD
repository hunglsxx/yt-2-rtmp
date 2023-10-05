### INSTALL
```npm install yt-2-rtmp```

### REQUIRES
- ffmpeg
- yt-dlp

### USE
```
const { YoutubeVideo } = require('yt-2-rtmp');

let videoOptions = {
    // Search keyword, either the song name or video id
    keyword: "Julius Dreisig & Zeus X Crona - Invisible [NCS Release]", 
    // Array of messages you want to display in your livestream
    messages: [
        "Good job bro!"
    ]
}
let song = new YoutubeVideo(videoOptions);

let extractOptions = {
    // Get the highest quality video from YouTube. 
    // Explore more options for video quality from yt-dlp library
    videoQuality: 'best' 
};
await song.extract(extractOptions); // Extract video information

let streamOptions = {
    // Your rtmp uri
    rtmp: 'rtmps://live-api-s.facebook.com:443/rtmp/FB-YOUR-STREAM-KEY',
    // Livestream loop count, default is -1 for forever
    loop: -1,
    // ffmpeg binary file path, default is ffmpeg
    ffmpegPath: 'ffmpeg', 
    // Position where messages will be shown in your livestream, defaul is "center"
    draw: 'center'
}
// Start stream
song.startStream(streamOptions);

// Pause stream
song.pauseStream();

// Dispose of paused stream
song.disposeStream();

// Gracefully stop stream
song.stopStream();

// Forcefully stop stream
song.killStream();

// Resume paused stream
song.resumeStream();

// In addition, you can use the YoutubeVideo class to retrieve information about a video as follows

let searchSong = new YoutubeVideo({
    keyword: "Hello - Adele", 
});

let oneSong = await searchSong.findOne(); // Return 1 song

const limit = 10;
let manySong = await searchSong.find(limit); // Return 10 songs
```

### EXAMPLES
- The code below livestreams a playlist of songs with messages to Facebook Live smoothly, minimizing interruptions during the live session.
```
import { YoutubeVideo, LivestreamConfig } from 'yt-2-rtmp';

(async () => {

    let musicList: Array<any> = [
        {
            keyword: "Julius Dreisig & Zeus X Crona - Invisible [NCS Release]",
            messages: [
                "Wishing you a lucky day",
                "Keep it up, my friend!"
            ]
        },
        {
            keyword: "Lost Sky - Fearless pt.II (feat. Chris Linton) | NCS - Copyright Free Music",
            messages: [
                "Hello, how are you doing?",
                "Turn up the music!"
            ]
        },
        {
            keyword: "Elektronomia - Fire",
            messages: [
                "Elektronomia - Fire",
                "From Viet Nam with love"
            ]
        }
    ];

    const rtmp = 'rtmps://live-api-s.facebook.com:443/rtmp/FB-YOUR-STREAM-KEY'

    let music = new YoutubeVideo(musicList.shift());
    await music.extract();
    music.startStream({ rtmp: rtmp });

    let endAt = new Date().getTime() + (music.videoDuration * 1000);

    while (musicList.length > 0) {
        if (new Date().getTime() > endAt) {
            let opts: LivestreamConfig = { rtmp: rtmp };
            if (musicList.length == 1) opts['loop'] = 3;

            music.stopStream();

            music = new YoutubeVideo(musicList.shift());
            await music.extract();
            music.startStream(opts);

            endAt = new Date().getTime() + (music.videoDuration * 1000);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

})();

```