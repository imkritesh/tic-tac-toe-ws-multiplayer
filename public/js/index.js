(function() {
// https://coderwall.com/p/uhqeqg/html5-websocket-with-angularjs
var app = angular.module('ticTacToeApp', ['ngWebSocket']);

app.controller('ticTacToeCtrl', function($websocket) {
  var vm = this;
  vm.playerInfo = {};

  var emptyCell = '?';
  
  var getInverseSign = function(sign) {
    return sign === 'X' ? 'O' : 'X'
  };

  // Websocket connection
  var ws = $websocket('ws://localhost:8080');
  // Websocket Incoming Message Handling
  ws.onMessage(function(message) {
    console.log('WS msg recvd:', message.data);
    var serverMsg = JSON.parse(message.data);
    if (serverMsg.event == 'playerIdentification') {
      console.log('PLAYER INDENTIFY');
      // Can only be 0 and 1
      let playerNumber = serverMsg.data.playerNumber;
      vm.reset(playerNumber);
    } else if (serverMsg.event == 'playerMove') {
      vm.board[serverMsg.data.row][serverMsg.data.column].value = getInverseSign(vm.playerInfo.playerSign);
      checkForEndOfGame();
      vm.playerInfo.isItMyTurn = !vm.playerInfo.isItMyTurn;
    }
  });

  ws.onError(function() {

  });

  vm.board = [
    [{value: emptyCell}, {value: emptyCell}, {value: emptyCell}],
    [{value: emptyCell}, {value: emptyCell}, {value: emptyCell}],
    [{value: emptyCell}, {value: emptyCell}, {value: emptyCell}]
  ];

  vm.reset = function(playerNumber) {
    console.log('RESET CALLED');
    vm.board.forEach(function(row) {
      row.forEach(function(cell) {
        cell.value = emptyCell;
      });
    });
    console.log(playerNumber);
    vm.playerInfo.playerNumber = playerNumber;
    vm.playerInfo.playerSign = (playerNumber == 0) ? 'X' : 'O';
    vm.playerInfo.isItMyTurn = (playerNumber == 0) ? true : false;
    vm.winner = false;
    vm.cat = false;
  };

  vm.getCurrentPlayer = function() {
    if (vm.playerInfo.isItMyTurn)
      return vm.playerInfo.playerSign;
    else
      return vm.playerInfo.playerSign === 'X' ? 'O' : 'X';
  };

  vm.isTaken = function(cell) {
    return cell.value !== emptyCell;
  };


  function checkForMatch(cell1, cell2, cell3) {
    // TODO: return true of cell1, cell2, and cell3 are the same and are not the
    // emptyCell.
  }

  function isBoardFull() {
    // TODO: return true if the board is full (no emptyCell values).
  }

  function checkForEndOfGame() {
    // TODO: update the booleans vm.winner and vm.cat
    // Check if somebody won

    // Otherwise Board is full 
    return vm.winner || vm.cat;
  }

  vm.move = function(rowIndex, columnIdex) {
    let cell = vm.board[rowIndex][columnIdex];
    cell.value = vm.playerInfo.playerSign;

    vm.playerInfo.isItMyTurn = !vm.playerInfo.isItMyTurn;
    var moveInfo = {
      'event': 'playerMove',
      'data': {'row': rowIndex, 'column': columnIdex}
    };
    ws.send(JSON.stringify(moveInfo));
    checkForEndOfGame();
  };
});
})();