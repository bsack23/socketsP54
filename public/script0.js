//get container for our canvas
const sketchContainer = document.getElementById('sketch-container');

//get socket which only uses websockets as a means of communication
const socket = io({
  transports: ['websocket'],
});

//the p5js sketch
const sketch = (p) => {
  let positions = {};
  //the p5js setup function
  p.setup = () => {
    //to fill up the full container, get the width an height
    const containerPos = sketchContainer.getBoundingClientRect();
    const cnv = p.createCanvas(containerPos.width, containerPos.height); //the canvas!
    p.textAlign(p.CENTER, p.CENTER);
    // p.textAlign(CENTER, CENTER); // this fails!
    cnv.mousePressed(() => {
      //when you click on the canvas, update your position
      socket.emit('updatePosition', {
        x: p.mouseX / p.width, // always send relative number of position between 0 and 1
        y: p.mouseY / p.height, //so it positions are the relatively the same on different screen sizes.
      });
    });

    p.frameRate(30); //set framerate to 30, same as server
    socket.on('positions', (data) => {
      //get the data from the server to continually update the positions
      positions = data;
    });
  };

  //the p5js draw function, runs every frame rate
  //(30-60 times / sec)
  p.draw = () => {
    p.background(0); //reset background to black
    //draw a circle for every position
    for (const id in positions) {
      const position = positions[id];
      p.fill(255); //sets the fill color of the circle to white
      p.ellipse(position.x * p.width, position.y * p.height, 20);
      p.fill(0); //sets the fill color of the text to white
      p.text(position.n, position.x * p.width, position.y * p.height);
    }
  };
};

//initialize the sketch!
new p5(sketch, sketchContainer);
