const cp = require('child_process');

console.log('args', process.argv);

const video = process.argv[2];
const audio = process.argv[3];
const name = process.argv[4];

if(video == '' || audio == '' || name == ''){
    process.exit('read the man page dummy');
}

// var youtube_dl = `youtube-dl ''`
function youtubeDL(url, type){
    // return `youtube-dl '${url}' -o ${name}-${type}`;
    return [
        `${url}`,
        `-o`,
        `${name}-${type}`
    ]
}

const video_cmd = youtubeDL(video, 'video');
const video_dl = cp.spawn('youtube-dl', video_cmd);

video_dl.stdout.on('data', (data) => {
  console.log(`video stdout: ${data}`);
});

video_dl.stderr.on('data', (data) => {
  console.log(`video stderr: ${data}`);
});

video_dl.on('close',  (code) => {
  console.log(`video dl exited with code ${code}`);

  const audio_cmd = youtubeDL(audio, 'audio');
  const audio_dl = cp.spawn('youtube-dl', audio_cmd);

  audio_dl.stdout.on('data', (data) => {
    console.log(`audio stdout: ${data}`);
  });

  audio_dl.stderr.on('data', (data) => {
    console.log(`audio stderr: ${data}`);
  });

  audio_dl.on('close', (code) => {
      console.log(`audio dl exited with code ${code}`);

      const ffmpeg_cmd = `-i ${name}-video.mkv -i ${name}-audio.mkv -c copy -map 0:v:0 -map 1:a:0 -shortest ${name}-mixed.mkv`;
      const ffmpeg = cp.spawn('ffmpeg',ffmpeg_cmd.split(' '));

      ffmpeg.stdout.on('data', (data) => {
        console.log(`ffmpeg stdout: ${data}`);
      });

      ffmpeg.stderr.on('data', (data) => {
        console.log(`ffmpeg stderr: ${data}`);
      });

      ffmpeg.on('close', (code)=>{
          console.log(`ffmpeg exited with code ${code}`);
      })
  });
});
