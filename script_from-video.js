var all_frames = [];
var all_output = [];
var video = document.createElement("video");
video.height = 400;
video.width = video.height * 1.774;
video.crossOrigin = "Anonymous";

const yolo = ml5.YOLO(modelLoaded, {
  filterBoxesThreshold: 0.01,
  IOUThreshold: 0.01,
  classProbThreshold: 0.5
});

function fromVideo() {
  video.addEventListener('loadeddata', function () {
    if (!isNaN(video.duration)) video.currentTime = 0;
  });

  video.addEventListener('seeked', function () {
    captureFrame(video);
  });

  document.querySelector('input').addEventListener('change', function (event) {
    let file = this.files[0];
    video.src = URL.createObjectURL(file);
    all_frames = [];
    all_output = [];
    document.getElementById("frames").innerHTML = '';
  });
}

function captureFrame(video) {
  let canvas = document.createElement('canvas');
  canvas.width = video.width;
  canvas.height = video.height;
  let context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  all_frames.push(canvas);

  if (video.currentTime < video.duration) {
    video.currentTime += 0.1;
  } else {
    startDetecting();
  }
}

function modelLoaded() {
  $('#ready_state').css('visibility', 'visible');
  console.log('Model Loaded!');
}

function startDetecting() {
  let i = 0;

  function processNextFrame() {
    if (i >= all_frames.length) {
      console.log(all_output);
      $('#progress').css('width', '0px');
      return;
    }

    yolo.detect(getImg(all_frames[i]), function (err, results) {
      if (!err) {
        drawDetections(all_frames[i], results);
        all_output.push(results);
        $('#progress').css('width', (i / all_frames.length) * window.innerWidth + 'px');
        document.getElementById("frames").appendChild(all_frames[i]);
      }
      i++;
      requestAnimationFrame(processNextFrame); // Non-blocking execution
    });
  }

  processNextFrame();
}

function drawDetections(canvas, results) {
  let ctx = canvas.getContext("2d");
  ctx.font = "13px Arial";
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  results.forEach(obj => {
    let x = obj.x * canvas.width;
    let y = obj.y * canvas.height;
    let w = obj.w * canvas.width;
    let h = obj.h * canvas.height;

    ctx.fillText(obj.className + " (" + Math.round(obj.classProb * 100) + "%)", x, y - 2);
    ctx.strokeRect(x, y, w, h);
  });
}

function getImg(canvas) {
  return new Image(canvas.width, canvas.height).src = canvas.toDataURL("image/png");
}
