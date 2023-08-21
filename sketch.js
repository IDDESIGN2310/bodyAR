console.log("ml5 version:", ml5.version);

let testImage;
let faceImage;
let chestImage;

let video;
let poseNet;
let poses = [];
let videoAreaCanvas;
let ml5VisualCanvas;
let bw, bh;
let videoScreenWidth;
let videoScreenHeight;
let doResize = false;

let partName_R = [
  "rightShoulser",
  "rightElbow",
  "rightWrist",
  "rightHip",
  "rightKnee",
  "rightAnkle",
];

let partName_L = [
  "leftShoulser",
  "leftElbow",
  "leftWrist",
  "leftHip",
  "leftKnee",
  "leftAnkle",
];

function redo() {
  /*
  doResize = false;
  setup();
  //video.clear();

  poseNet.removeListener("pose", function (results) {
    poses = results;
  });*/
  location.reload();
}

window.onresize = redo;

function preload() {
  testImage = loadImage("images/parts2.png");
  faceImage = loadImage("images/parts3.png");
  chestImage = loadImage("images/parts4.png");
}

function setup() {
  bw = window.innerWidth;
  bh = window.innerHeight;

  videoScreenWidth = bw / 2;
  videoScreenHeight = videoScreenWidth * (3 / 4);

  createCanvas(videoScreenWidth * 2, videoScreenHeight);
  ml5VisualCanvas = createGraphics(videoScreenWidth, videoScreenHeight);
  ml5VisualCanvas.clear();

  video = createCapture(VIDEO);
  //video.parent("videoFeed");
  video.size(videoScreenWidth, videoScreenHeight);

  ml5ImageReady();

  video.hide();

  doResize = true;
}

function modelReady() {
  select("#status").html("Model Loaded");
}

function ml5ImageReady() {
  let options = {
    architecture: "ResNet50",
    imageScaleFactor: 0.3,
    outputStride: 32,
    detectionType: "single",
    minConfidence: 0.4,
    maxPoseDetections: 5,
    scoreThreshold: 0.9,
    nmsRadius: 10,
    inputResolution: 321,
    multiplier: 0.75,
    quantBytes: 4,
  };

  poseNet = ml5.poseNet(video, options, modelReady);
  poseNet.on("pose", function (results) {
    poses = results;
  });
}

function draw() {
  if (doResize) {
    background(220);

    //Create Mirror Image of Video and ml5visualisation
    push();
    scale(-1, 1);
    image(video, -videoScreenWidth, 0);
    image(ml5VisualCanvas, -videoScreenWidth * 2, 0);
    ml5VisualCanvas.background(220);
    // drawKeypoints();
    //drawConnection(ml5VisualCanvas, poses, "rightShoulder", "rightElbow");
    //ml5VisualCanvas.testDrawConnection(poses, "rightShoulder", "rightElbow");
    drawConnections(ml5VisualCanvas, poses);
    //drawSkeleton();
    pop();
  }
}

function drawConnection(tar_canvas, poseArray, startPoint, endPoint) {
  for (let i = 0; i < poseArray.length; i++) {
    let pose = poseArray[i].pose;
    tar_canvas.fill(0, 0, 0);
    tar_canvas.noStroke();
    tar_canvas.ellipse(pose.nose.x, pose.nose.y, 20, 20);

    let startV = createVector(pose[startPoint].x, pose[startPoint].y);
    let endV = createVector(pose[endPoint].x, pose[endPoint].y);

    let betweenRsRe = p5.Vector.sub(startV, endV).div(2);
    //tar_canvas.rectMode(CENTER);
    tar_canvas.fill(255, 0, 0);
    tar_canvas.push();
    tar_canvas.angleMode(RADIANS);
    tar_canvas.translate(startV.x - betweenRsRe.x, startV.y - betweenRsRe.y);
    let angle = betweenRsRe.heading();
    tar_canvas.rotate(angle);
    tar_canvas.rect(-25, -20, 50, 40);
    tar_canvas.pop();
  }
}

function drawConnections(tar_canvas, poseArray) {
  for (let i = 0; i < poseArray.length; i++) {
    let poseA = poseArray[i].pose;

    //right arm upper
    let rightArmUpper = connection(poseA, "rightShoulder", "rightElbow");
    renderConnection(tar_canvas, rightArmUpper, 50, 40, testImage, 1);

    //right arm low
    let rightArmLow = connection(poseA, "rightElbow", "rightWrist");
    renderConnection(tar_canvas, rightArmLow, 50, 40, testImage, 1);

    //left arm upper
    let leftArmUpper = connection(poseA, "leftShoulder", "leftElbow");
    renderConnection(tar_canvas, leftArmUpper, 50, 40, testImage, 1);

    //left arm low
    let leftArmLow = connection(poseA, "leftElbow", "leftWrist");
    renderConnection(tar_canvas, leftArmLow, 50, 40, testImage, 1);

    //right leg upper
    let rightLegUpper = connection(poseA, "rightHip", "rightKnee");
    renderConnection(tar_canvas, rightLegUpper, 50, 40, testImage, 1);

    //right leg low
    let rightLegLow = connection(poseA, "rightKnee", "rightAnkle");
    renderConnection(tar_canvas, rightLegLow, 50, 40, testImage, 1);

    //left leg upper
    let leftLegUpper = connection(poseA, "leftHip", "leftKnee");
    renderConnection(tar_canvas, leftLegUpper, 50, 40, testImage, 1);

    //rleft leg low
    let leftLegLow = connection(poseA, "leftKnee", "leftAnkle");
    renderConnection(tar_canvas, leftLegLow, 50, 40, testImage, 1);

    let faceArea = connection(poseA, "rightEar", "leftEar");
    renderConnection(tar_canvas, faceArea, 40, 60, faceImage, 2);

    let chestArea = connection(poseA, "rightShoulder", "leftShoulder");
    renderConnection(tar_canvas, chestArea, 40, 60, chestImage, 3);
  }
}

function renderConnection(tar_canvas, connectionData, w, h, pImg, type) {
  if (connectionData[3] > 0.1 && connectionData[4] > 0.1) {
    let size = dist(
      connectionData[5],
      connectionData[6],
      connectionData[7],
      connectionData[8]
    );

    tar_canvas.fill(0);
    tar_canvas.circle(connectionData[5], connectionData[6], size * 0.08);
    tar_canvas.circle(connectionData[7], connectionData[8], size * 0.08);

    tar_canvas.push();
    tar_canvas.noFill();
    tar_canvas.stroke(0, 0, 0, 30);
    tar_canvas.angleMode(RADIANS);
    tar_canvas.translate(connectionData[0], connectionData[1]);

    switch (type) {
      case 1:
        tar_canvas.rotate(connectionData[2]);
        tar_canvas.image(pImg, -size / 2, -(size * 0.4) / 2, size, size * 0.4);
        tar_canvas.rect(-size / 2, -(size * 0.4) / 2, size, size * 0.4);
        break;
      case 2:
        tar_canvas.rotate(connectionData[2] + PI);
        tar_canvas.image(pImg, -size / 2, -size / 2, size, size);
        tar_canvas.rect(-size / 2, -size / 2, size, size);
        break;
      case 3:
        tar_canvas.rotate(connectionData[2] + PI);
        tar_canvas.image(pImg, -size / 2, 0, size, size);
        tar_canvas.rect(-size / 2, 0, size, size);
        break;
    }

    tar_canvas.pop();
  }
}

function connection(poseArray, startPoint, endPoint) {
  let startV = createVector(poseArray[startPoint].x, poseArray[startPoint].y);
  let endV = createVector(poseArray[endPoint].x, poseArray[endPoint].y);

  let betweenRsRe = p5.Vector.sub(startV, endV).div(2);
  let angle = betweenRsRe.heading();
  let px = startV.x - betweenRsRe.x;
  let py = startV.y - betweenRsRe.y;
  let confidenceStart = poseArray[startPoint].confidence;
  let confidenceEnd = poseArray[endPoint].confidence;
  let res = [
    px,
    py,
    angle,
    confidenceStart,
    confidenceEnd,
    startV.x,
    startV.y,
    endV.x,
    endV.y,
  ];

  return res;
}

function drawKeypoints() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.15) {
        ml5VisualCanvas.fill(255, 0, 0);

        ml5VisualCanvas.noStroke();
        ml5VisualCanvas.ellipse(
          keypoint.position.x,
          keypoint.position.y,
          10,
          10
        );
      }
    }
  }
}

function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      ml5VisualCanvas.stroke(255, 0, 0);
      ml5VisualCanvas.line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}
