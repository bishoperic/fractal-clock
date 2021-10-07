let vw, vh;
let hw, hh;
let depth = 9;
let angles;
let shrinkfactor = Math.sqrt(2) / 2;
let time;
let avgdelta = [];

'use strict';

function setup() {
  createCanvas(1280, 1280);
  frameRate(30);
  vw = width / 100;
  vh = height / 100;
  hw = width / 2;
  hh = height / 2;

  rectMode(CENTER);
  angleMode(RADIANS);
  textAlign(CENTER, CENTER);
  textSize(18);
  colorMode(HSB);
}

function draw() {
  background(0, 0, 15);
  fill(0, 0, 100);

  avgdelta.unshift(deltaTime);

  if (avgdelta.length > 10) {
    let avg = avgdelta.reduce((a, b) => a + b) / avgdelta.length;

    if (avg > 50) {
      --depth;
      avgdelta.length = 0;
    } else {
      avgdelta.length = 10;
    }

  } else if (deltaTime > 500) {
    --depth;
  }

  noStroke();
  smooth();

  time = Date.now() % (1000 * 60 * 60 * 24);
  let hour = (time / (1000 * 60 * 60)) % 24;
  let minute = (time / (1000 * 60)) % 60;
  let second = (time / 1000) % 60;

  let hourAngle = map(hour, 0, 24, 0, TWO_PI);
  let minuteAngle = map(minute, 0, 60, 0, TWO_PI);
  let secondAngle = map(second, 0, 60, 0, TWO_PI);

  // angles = [hourAngle, minuteAngle, secondAngle];
  angles = [minuteAngle, secondAngle];

  let hands = [
    // new Stick(createVector(0), hourAngle, 150, 5),
    new Stick(createVector(0), minuteAngle, 150, 4),
    new Stick(createVector(0), secondAngle, 150, 3)
  ];

  for (let i = 0; i < depth; i++) {
    for (const hand of hands) {
      hand.addLayer();
    }
  }

  translate(hw, hh);
  push();

  strokeWeight(0)
  for (let i = 0; i < 60; i++) {
    let angle = (i + 1) * PI / 30;
    rotate(PI / 30);
    if ((i + 1) % 5 == 0) {
      rect(0, -200, 6, 20);

      push();

      let dist = 165;
      rotate(-angle);
      translate(-sin(-angle) * dist, -cos(-angle) * dist);

      text((i + 1) / 5, 0, 0);

      pop();

    } else {
      rect(0, -204, 4, 10);
    }
  }

  push()
  for (const hand of hands) {
    hand.draw();
  }
  pop();

  pop();

}

class Stick {
  constructor(startpoint, angle, length, weight, depth = 0) {
    this.angle = angle;
    this.length = length;
    this.weight = weight;
    this.start = startpoint;
    this.children = [];
    this.depth = depth;
  }

  draw() {
    push();
    translate(this.start);
    rotate(this.angle);
    if (this.depth == 0) {
      stroke(0, 0, 100);
    } else {
      stroke(map((time / 15000 - this.depth / (depth * 2)) % 2, 0, 2, 0, 360, true), 77, 77);
    }
    strokeWeight(this.weight);
    line(0, 0, 0, -this.length);


    for (const child of this.children) {
      child.draw();
    }
    pop()
  }

  addLayer() {
    if (this.children.length == 0) {
      for (const angle of angles) {
        this.children.push(new Stick(createVector(0, -this.length), angle, this.length * shrinkfactor, this.weight * 0.85, this.depth + 1));
      }
    } else {
      for (const child of this.children) {
        child.addLayer();
      }
    }
  }
}