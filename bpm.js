const cp = require('child_process');

console.log('args', process.argv);

const video = process.argv[2];
var name = 'test';

function youtubeDL(url, type){
    return [
        `${url}`,
        `-o`,
        `bpm/${name}-${type}`
    ]
}

const video_cmd = youtubeDL(video, 'video');
const video_dl = cp.spawn('youtube-dl', video_cmd);
var video_name, audio_name;

video_dl.stdout.on('data', (data) => {
  console.log(`video stdout: ${data}`);
  // console.log(typeof data);
  if(String(data).includes('Merging')){
      video_name = String(data).split(' ')[4].replace(/["\n]/g, '');
      console.log('video name', video_name);
  } else if (String(data).includes('downloaded and merged')){
      video_name = String(data).split(' ')[1].replace(/["\n]/g, '');
      console.log('video name', video_name);
  }
});

video_dl.stderr.on('data', (data) => {
  console.log(`video stderr: ${data}`);
});

video_dl.on('close', (code)=>{
  console.log(`video dl exited with code ${code}`);
  var split = video_name.split(".");
  var suffix = split[split.length-1];
  audio_name = video_name.replace(suffix, 'mp3');
  const ffmpeg_cmd = `-i ${video_name} -c copy -vn -acodec libmp3lame ${audio_name} -y`;
  const ffmpeg = cp.spawn('ffmpeg', ffmpeg_cmd.split(' '));

  ffmpeg.stdout.on('data', (data)=>{
      console.log('ffmpeg stdout:', data);
  });
  ffmpeg.stderr.on('data', (data)=>{
      console.log('ffmpeg stderr:', String(data));
  });

  ffmpeg.on('close', code=>{
      console.log('ffmpeg exited with:', code);
      const sox_cmd = `${audio_name} -t raw -r 44100 -e float -c 1 -`;
      const sox = cp.spawn('sox', sox_cmd.split(' '));

      // sox.stdout.on('data', data=>{
      //     console.log('sox stdout:', String(data));
      // })

      const bpm = cp.spawn('bpm');

      sox.stdout.pipe(bpm.stdin);

      sox.stderr.on('data', data=>{
          console.log('sox stderr:', String(data));
      })
      sox.on('close', code=>{
          console.log('sox closed with:', code);
      });

      bpm.stdout.on("data", data=>{
          console.log('bpm stdout:', String(data));
      })
      bpm.stderr.on('data', data=>{
          console.log('bpm stderr:', String(data));
      })
      bpm.on('close', code=>{
          console.log('bpm closed with:', code);
      });



  })


})
