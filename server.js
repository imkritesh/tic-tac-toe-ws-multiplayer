var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

// Common Datapoints
var allowed_client_types = ['pldp_events', 'tm_params'];
var serverPort = 1337;

// Publisher Client
var pub_client = {};
// Subscriber Clients
var sub_clients = {};

allowed_client_types.forEach(function(client_type) {
  pub_client[client_type] = null;
  sub_clients[client_type] = [];
});

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  if (request.url == '/game') {
    response.writeHead(200);
    var file = fs.createReadStream('index.html');
    file.pipe(response);
  }
});
server.listen(serverPort, function() {
  console.log((new Date()) + ' Server is listening on port ' + serverPort);
});

// Create the server
wsServer = new WebSocketServer({httpServer: server});

// WebSocket server
wsServer.on('request', function(request) {
  getQueryParams = request.resourceURL.query;
  console.log(getQueryParams);

  if (getQueryParams.type != undefined &&
      getQueryParams.is_publisher != undefined &&
      allowed_client_types.includes(getQueryParams.type)) {
    // Allow client connection only if url req-params are present correctly

    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    // string
    var clientType = getQueryParams.type;
    // boolean
    var isPublisher = (getQueryParams.is_publisher == 'true');

    var listIndex = null;

    if (isPublisher)
      pub_client[clientType] = connection;
    else
      listIndex = sub_clients[clientType].push(connection) - 1;

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        var messageText = message.utf8Data;

        console.log(messageText);
        if (isPublisher) {
          for (let sub_client of sub_clients[clientType]) {
            sub_client.sendUTF(messageText);
          }
        } else {
          if (pub_client[clientType] != null) pub_client.sendUTF();
        }
      }
    });

    connection.on('close', function(connection) {
      // close user connection
      console.log((new Date()) + ' Connection Closed');
      if (isPublisher)
        pub_client[clientType] = null;
      else {
        sub_clients[clientType].splice(listIndex);
      }
    });
  }
});