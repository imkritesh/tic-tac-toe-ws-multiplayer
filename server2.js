const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

var path = require('path');
var bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.sendFile('index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

var players = [];

wss.on('connection', function connection(ws, req) {
  console.log('Client Connected');
  const location = url.parse(req.url, true);
  // You might use location.query.access_token to authenticate or share sessions
  // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  var playerIndex = players.push(ws) - 1;
  console.log(players.length);

  var playerInfo = {
    'event': 'playerIdentification',
    'data': {'playerNumber': (playerIndex % 2 == 0) ? 0 : 1}
  };
  ws.send(JSON.stringify(playerInfo));

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    let clientMsg = JSON.parse(message);
    if (clientMsg.event == 'playerMove') {
      let playerIndexToSend =
          (playerIndex % 2 == 0) ? (playerIndex + 1) : (playerIndex - 1);
      if (playerIndexToSend < players.length) {
        console.log('SENDING MOVE INFO');
        players[playerIndexToSend].send(message);
      }
    }
  });

  ws.on('error', function(error) {
    console.log('socket error: ' + error);
    players.splice(playerIndex);
  });

  ws.on('close', function close() {
    console.log('Client disconnected');
    players.splice(playerIndex);
  });
  ws.send('TEST YOLO');
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});