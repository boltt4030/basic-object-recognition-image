function drawRectangle(y, x, w, h, lbl, iter) {
    var box = $(".box").clone();
    box.find(".box_label").text(lbl);
    box.addClass("cl" + iter);
    box.css({
      display: "block",
      right: x + "px",
      top: y + "px",
      width: w + "px",
      height: h + "px"
    });
    $(".real_time").append(box);
  }
  
  var yolo_rt;
  var iter = 0;
  var doLoop = false;
  
  async function showWebcam() {
    const video = document.querySelector("#webcam_feed");
  
    if (doLoop) return; // Prevent multiple loops from starting
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await new Promise(resolve => (video.onloadedmetadata = resolve)); // Wait for metadata
  
      yolo_rt = ml5.YOLO(video, () => {
        console.log("YOLO model loaded!");
        doLoop = true;
        realTimeYOLO();
      });
    } catch (error) {
      console.error("Webcam access error:", error);
    }
  }
  
  function realTimeYOLO() {
    if (!doLoop) return; // Stop loop if needed
  
    const time_start = performance.now();
    yolo_rt.detect((err, results) => {
      if (err) {
        console.error("YOLO detection error:", err);
        return;
      }
  
      const time_end = performance.now();
      const width = $("#webcam_feed").width();
      const height = $("#webcam_feed").height();
  
      $(".cl" + iter).remove(); // Remove old boxes
      iter++;
  
      $(".time").text(`Processing time: ${(time_end - time_start).toFixed(2)} ms`);
      $(".objno").text(`Objects detected: ${results.length}`);
  
      results.forEach(({ x, y, w, h, className, classProb }) => {
        const lbl = `${className} (${Math.round(classProb * 100)}%)`;
        drawRectangle(y * height, x * width, w * width, h * height, lbl, iter);
      });
  
      requestAnimationFrame(realTimeYOLO); // Run smoothly in next frame
    });
  }
  
  function stopDetection() {
    doLoop = false;
    $(".cl" + iter).remove();
  }
  