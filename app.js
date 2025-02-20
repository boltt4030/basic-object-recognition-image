// declare global variables
let img = null; // uploaded image element
let detector = null; // detector object
let detections = []; // store detection results

// global HTML elements
const fileInput = document.getElementById('fileInput');
const detectButton = document.getElementById('detectButton');

// set cursor to wait until detector is loaded
document.body.style.cursor = 'wait';

// Preload function to initialize object detector
function preload() {
  detector = ml5.objectDetector('cocossd', () => {
    console.log('Detector object is loaded');
    document.body.style.cursor = 'default';
  });
}

// Setup function to initialize the canvas
function setup() {
  createCanvas(640, 480);
  console.log('Canvas is created');
}

// Handle image upload
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img = loadImage(e.target.result, () => {
        console.log('Image is loaded');
        redraw();
      });
    };
    reader.readAsDataURL(file);
  }
});

// Handle detection button click
detectButton.addEventListener('click', () => {
  if (img && detector) {
    detector.detect(img, onDetected);
  }
});

// Callback function when objects are detected
function onDetected(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  detections = results;
  redraw();
}



// Draw function to display the image and detections
function draw() {
  if (!img) return;

  // Scale factors to adjust bounding boxes
  let imgAspectRatio = img.width / img.height;
  let canvasAspectRatio = width / height;
  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspectRatio > canvasAspectRatio) {
    drawWidth = width;
    drawHeight = width / imgAspectRatio;
    offsetX = 0;
    offsetY = (height - drawHeight) / 2;
  } else {
    drawHeight = height;
    drawWidth = height * imgAspectRatio;
    offsetX = (width - drawWidth) / 2;
    offsetY = 0;
  }

  image(img, offsetX, offsetY, drawWidth, drawHeight);

  for (let i = 0; i < detections.length; i++) {
    drawResult(detections[i], offsetX, offsetY, drawWidth / img.width, drawHeight / img.height);
  }
}

function drawResult(object, offsetX, offsetY, scaleX, scaleY) {
  drawBoundingBox(object, offsetX, offsetY, scaleX, scaleY);
  drawLabel(object, offsetX, offsetY, scaleX, scaleY);
}

function drawBoundingBox(object, offsetX, offsetY, scaleX, scaleY) {
  stroke('green');
  strokeWeight(4);
  noFill();
  rect(
    offsetX + object.x * scaleX,
    offsetY + object.y * scaleY,
    object.width * scaleX,
    object.height * scaleY
  );
}

function drawLabel(object, offsetX, offsetY, scaleX, scaleY) {
  noStroke();
  fill('white');
  textSize(24);
  text(
    object.label,
    offsetX + object.x * scaleX + 10,
    offsetY + object.y * scaleY + 24
  );
}
