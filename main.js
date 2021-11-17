import p5 from 'p5';

import './style.css';
'use strict';

let vw, vh;
let hw, hh;
let depth = 9;
let angles;
let shrinkfactor = Math.sqrt(2) / 2;
let time;
let avgdelta = [];

const _app = new p5(p5Instance => {
  const p = p5Instance;

  p.setup = function setup() {
    p.createCanvas(1280, 1280);
    p.frameRate(30);
    vw = p.width / 100;
    vh = p.height / 100;
    hw = p.width / 2;
    hh = p.height / 2;

    p.rectMode(p.CENTER);
    p.angleMode(p.RADIANS);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(18);
    p.colorMode(p.HSB);
  };

  p.draw = function draw() {
    p.background(0, 0, 15);
    p.fill(0, 0, 100);

    avgdelta.unshift(p.deltaTime);

    if (avgdelta.length > 10) {
      let avg = avgdelta.reduce((a, b) => a + b) / avgdelta.length;

      if (avg > 50) {
        --depth;
        avgdelta.length = 0;
      } else {
        avgdelta.length = 10;
      }

    } else if (p.deltaTime > 500) {
      --depth;
    }

    p.noStroke();
    p.smooth();

    time = Date.now() % (1000 * 60 * 60 * 24);
    let hour = (time / (1000 * 60 * 60)) % 24;
    let minute = (time / (1000 * 60)) % 60;
    let second = (time / 1000) % 60;

    let hourAngle = p.map(hour, 0, 24, 0, p.TWO_PI);
    let minuteAngle = p.map(minute, 0, 60, 0, p.TWO_PI);
    let secondAngle = p.map(second, 0, 60, 0, p.TWO_PI);

    // angles = [hourAngle, minuteAngle];
    // angles = [minuteAngle, secondAngle];
    angles = [hourAngle, minuteAngle, secondAngle];

    let hands = [
      new Stick(p.createVector(0), hourAngle, 150, 5),
      new Stick(p.createVector(0), minuteAngle, 150, 4),
      new Stick(p.createVector(0), secondAngle, 150, 3)
    ];

    for (let i = 0; i < depth; i++) {
      for (const hand of hands) {
        hand.addLayer();
      }
    }

    p.translate(hw, hh);
    p.push();

    p.strokeWeight(0)
    for (let i = 0; i < 60; i++) {
      let angle = (i + 1) * p.PI / 30;
      p.rotate(p.PI / 30);
      if ((i + 1) % 5 == 0) {
        p.rect(0, -200, 6, 20);

        p.push();

        let dist = 165;
        p.rotate(-angle);
        p.translate(-p.sin(-angle) * dist, -p.cos(-angle) * dist);

        p.text((i + 1) / 5, 0, 0);

        p.pop();

      } else {
        p.rect(0, -204, 4, 10);
      }
    }

    p.push()
    for (const hand of hands) {
      hand.draw();
    }
    p.pop();

    p.pop();

  };

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
      p.push();
      p.translate(this.start);
      p.rotate(this.angle);
      if (this.depth == 0) {
        p.stroke(0, 0, 100);
      } else {
        p.stroke(p.map((time / 15000 - this.depth / (depth * 2)) % 2, 0, 2, 0, 360, true), 77, 77);
      }
      p.strokeWeight(this.weight);
      p.line(0, 0, 0, -this.length);


      for (const child of this.children) {
        child.draw();
      }
      p.pop()
    }

    addLayer() {
      if (this.children.length == 0) {
        for (const angle of angles) {
          this.children.push(new Stick(p.createVector(0, -this.length), angle, this.length * shrinkfactor, this.weight * 0.85, this.depth + 1));
        }
      } else {
        for (const child of this.children) {
          child.addLayer();
        }
      }
    }
  }
}, document.getElementById('app'));

