var boxSz = 250;
var numSpheres = 300;
var x = [];
var y = [];
var z = [];
var t = 0.0;
let clients = {};
let maxColor = 1;
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  directionalLight(250, 250, 250, 1, -1, 0.25);
  directionalLight(250, 250, 250, -1, 1, 0.25);

  fetch(window.location.href.replace("/static/visualizer.html","/unli/clients"))
      .then(response => response.json())
      .then(data => {
        console.log(data) // Prints result from `response.json()` in getRequest
        clients = data;
        Object.keys(clients).forEach(key => {
          let client = clients[key];
          if(client.groupe > maxColor) {
            maxColor = client.groupe;
          }
        });
      })
      .catch(error => console.error(error));
  // println(x);
  // println(y);
  // println(z);
}

function draw() {
  background(0, 0, 0);
  //translate(0,0,-100);
  rotateY(frameCount * 0.01);

  stroke(0,255,255);
  //front
  line(-boxSz, -boxSz, boxSz, boxSz, -boxSz, boxSz);
  line(-boxSz, boxSz, boxSz, boxSz, boxSz, boxSz);
  line(-boxSz, -boxSz, boxSz, -boxSz, boxSz, boxSz);
  line(boxSz, -boxSz, boxSz, boxSz, boxSz, boxSz);

  //back
  line(-boxSz, -boxSz, -boxSz, boxSz, -boxSz, -boxSz);
  line(-boxSz, boxSz, -boxSz, boxSz, boxSz, -boxSz);
  line(-boxSz, -boxSz, -boxSz, -boxSz, boxSz, -boxSz);
  line(boxSz, -boxSz, -boxSz, boxSz, boxSz, -boxSz);

  //left top
  line(-boxSz, -boxSz, boxSz, -boxSz, -boxSz, -boxSz);
  //left bottom
  line(-boxSz, boxSz, -boxSz, -boxSz, boxSz, boxSz);
  //right top
  line(boxSz, -boxSz, boxSz, boxSz, -boxSz, -boxSz);
  // // right bottom
  line(boxSz, boxSz, -boxSz, boxSz, boxSz, boxSz);

  Object.keys(clients).forEach(key => {
    let client = clients[key];
    push();
    translate(client.x, client.y, client.z);
    let colour = Math.floor(client.groupe * 0xFFFFFF / maxColor)+2000;
    let colorStringVal = "#" + colour.toString(16).padStart(6, '0');
    let outside = color(255, 0, 0);
    ambientMaterial(colorStringVal);
    sphere(boxSz / 50, 8);
    pop();
  });

}