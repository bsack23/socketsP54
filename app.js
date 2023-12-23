// https://medium.com/geekculture/multiplayer-interaction-with-p5js-f04909e13b87
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  transports: ['websocket'], //set to use websocket only
}); //this loads socket.io and connects it to the server.
// const io = require('socket.io')();
// io.on('connection', client => { ... });
//io.listen(3000);

const port = process.env.PORT || 8080;
// const port = process.env.PORT || 80;

//this next line makes sure we can put all our html/css/javascript in the public directory
app.use(express.static(__dirname + '/public'));
//we just have 1 route to the home page rendering an index html
app.get('/', (req, res) => {
  res.render('index.html');
});

//run the server which uses express
http.listen(port, () => {
  console.log(`Server is active at port:${port}`);
});

//store the positions of each client in this object.
//It would be safer to connect it to a database as well so the data doesn't get destroyed when the server restarts
//but we'll just use an object for simplicity.
const positions = {};
// make an array for all of the stored positions
const storedPositions = {};
const playerIDs = [];
let num = 0;
//Socket configuration
io.on('connection', (socket) => {
  //each time someone visits the site and connects to socket.io this function  gets called
  //it includes the socket object from which you can get the id, useful for identifying each client
  console.log(`${socket.id} connected`);
  io.to(socket.id).emit('yourID', socket.id);
  playerIDs.push(socket.id);
  io.to(playerIDs[0]).emit('yourTurn', 1);
  console.log(`${playerIDs[0]} turn`);
  // add a starting position when the client connects
  // for this, everyone starts at grid 1, 1
  positions[socket.id] = { x: 1, y: 1, n: num };
  // make a new array for each new connection
  storedPositions[socket.id] = [];
  num++;
  // send everyones positions to every connected client?
  io.emit('positions', positions); // ehh?
  io.emit('storedPositions', storedPositions);
  socket.on('disconnect', () => {
    //when this client disconnects, delete its position from the object.
    delete positions[socket.id];
    delete storedPositions[socket.id];
    playerIDs.splice(playerIDs.indexOf(socket.id), 1);
    console.log(`${socket.id} disconnected`);
  });

  //client can send a message 'updatePosition' each time the clients position changes
  socket.on('updatePosition', (data) => {
    positions[socket.id].x = data.x;
    positions[socket.id].y = data.y;
    positions[socket.id].n = data.n;
    io.emit('positions', positions);
    // console.log('here' + positions);
  });
  socket.on('storePosition', (data) => {
    storedPositions[socket.id].push({ x: data.x, y: data.y, n: data.n });
    console.log(storedPositions);
    io.emit('storedPositions', storedPositions);
    // io.emit('storedPositions', 'hello');
    console.log('here are the arrays');
    // this would be where the playerIDs array would be rotated
    // and message sent to player with next turn
    const toLast = playerIDs.shift();
    playerIDs.push(toLast);
    io.emit('yourTurn', 0);
    io.to(playerIDs[0]).emit('yourTurn', 1);
    console.log(`${playerIDs[0]}\'s turn`);
  });
});

//send positions every framerate to each client
// may not need this for our application -
// consider doing an 'emit' only when there's a change?
const frameRate = 30;
setInterval(() => {
  // io.emit('positions', positions);
  // io.emit('storedPositions', storedPositions);
}, 1000 / frameRate);
