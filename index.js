const express = require('express'); 
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(5000, function() {
  console.log('Socket IO server listening on port 5000');
});
app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/map', function(req, res) {
  res.sendFile(__dirname + '/map.html');
});

app.get('/generate/id', function(req, res) {
  id = Math.floor(Math.random() * 10000);
  res.send(`${id}`);
});

difRad = 0.01
width = 1200
height = 700
players = [];

function calcDiff(rad) {
  return 2*(rad+5)/(rad-3);
}



io.on('connection', function(socket) {
  socket.on('join', function() {
  });

  socket.on('move', function(data) {
    for(var i = 0; i < players.length; i++){
      if(players[i].id === data.id) {
        const difPos = calcDiff(players[i].r);
        if(data.dir === 'up' && players[i].y - difPos - players[i].r > 0){
          players[i].y = players[i].y - difPos;
          players[i].r = players[i].r + difRad;
        }
        if(data.dir === 'down' && players[i].y + difPos + players[i].r < height){
          players[i].y = players[i].y + difPos;
          players[i].r = players[i].r + difRad;
        }
        if(data.dir === 'left' && players[i].x - difPos - players[i].r > 0){
          players[i].x = players[i].x - difPos;
          players[i].r = players[i].r + difRad;
        }
        if(data.dir === 'right' && players[i].x + difPos + players[i].r < width){
          players[i].x = players[i].x + difPos;
          players[i].r = players[i].r + difRad;
        }
      }
    }
  });

  socket.on('generateId', function() {
    player = {
      height,
      width,
      id: Math.floor(Math.random() * 10000),
      x: Math.floor(Math.random() * 1000) + 100,
      y: Math.floor(Math.random() * 500 + 100),
      r: 5
    };
    players.push(player);

    socket.emit('join', player);
  });

  setInterval(function(){ 
    socket.emit('players', players)
  }, 10);

  setInterval(function(){ 
    for(var i = 0; i < players.length; i++){
      for(var j = i+1; j < players.length; j++){
        if(Math.pow(players[i].r + players[j].r, 2)
          >= Math.pow(players[i].x - players[j].x, 2) + Math.pow(players[i].y - players[j].y, 2)){
            removeIdx = (players[i].r > players[j].r) ? j : i;
            socket.broadcast.emit('die', players[removeIdx].id);
            players.splice(removeIdx, 1);
          }
      }
    }
  }, 10);
});
