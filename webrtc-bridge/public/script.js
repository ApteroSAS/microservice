
var boxSz = 250;
var numSpheres = 300;
var x = [];
var y = [];
var z = [];
var t = 0.0;
let clients = {};
let colorClaim = {};
let colorClaimOrder = [];

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function recomputeColorClaim(){
  let nextColor = 1;
  let maxColor = colorClaimOrder.length;
  colorClaimOrder.forEach(id =>{
    let colour = Math.floor(nextColor * (0xFFFFFF / maxColor));
    const colorStringVal = "#" + colour.toString(16).padStart(6, '0');
    colorClaim[id] = colorStringVal
    nextColor++;
  });
}

function claimColor(id){
  if(colorClaim[id]){
    return;
  }else {
    //colorClaimOrder.push(id);
    //recomputeColorClaim();
    let colorStringVal = rgbToHex(getRndInteger(0,255),getRndInteger(0,255),getRndInteger(0,255));
    colorClaim[id] = colorStringVal
  }
}


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  directionalLight(250, 250, 250, 1, -1, 0.25);
  directionalLight(250, 250, 250, -1, 1, 0.25);
  setInterval(()=>{
    fetch(window.location.href.replace("/static/visualizer.html","/unli/clients"))
        .then(response => response.json())
        .then(data => {
          console.log(data) // Prints result from `response.json()` in getRequest
          clients = data;
          Object.keys(clients).forEach(key => {
            let client = clients[key];
            claimColor(client.groupName);
          });
        })
        .catch(error => console.error(error));
  },1000);
  // println(x);
  // println(y);
  // println(z);
}

function draw() {
  background(0, 128, 128);
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
    let colorStringVal = colorClaim[client.groupName];
    let outside = color(255, 0, 0);
    ambientMaterial(colorStringVal);
    sphere(boxSz / 50, 8);
    pop();
  });

}