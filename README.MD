### INSTALL
```npm install yt-2-rtmp```

### REQUIRES
- ffmpeg
- yt-dlp

### EXAMPLES
```
import { Youtube, LivestreamConfig } from 'yt-2-rtmp';

(async () => {

    let musicList: Array<any> = [
        {
            keyword: "Julius Dreisig & Zeus X Crona - Invisible [NCS Release]",
            messages: [
                "Chúc bạn một ngày may mắn",
                "Cố lên nha bạn yêu"
            ]
        },
        {
            keyword: "Lost Sky - Fearless pt.II (feat. Chris Linton) | NCS - Copyright Free Music",
            messages: [
                "Hello xin chào, khỏe không bạn",
                "Nghe nhạc này cho nó lên"
            ]
        },
        {
            keyword: "Elektronomia - Fire",
            messages: [
                "Hello xin chào, khỏe không bạn",
                "Nghe nhạc này cho nó lên"
            ]
        }
    ];

    const rtmp = 'rtmps://live-api-s.facebook.com:443/rtmp/FB-YOUR-STREAM-KEY'

    let music = new Youtube(musicList.shift());
    await music.extract();
    music.startStream({ rtmp: rtmp });
    let endAt = new Date().getTime() + (music.videoDuration * 1000);

    while (musicList.length > 0) {
        if (new Date().getTime() > endAt) {
            let opts:LivestreamConfig = { rtmp: rtmp };
            if (musicList.length == 1) opts['loop'] = 3;

            music.pauseStream();
            music.disposeStream();

            music = new Youtube(musicList.shift());
            await music.extract();

            music.startStream(opts);

            endAt = new Date().getTime() + (music.videoDuration * 1000);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

})();

```