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
  var ws = $websocket('ws://10.10.5.197:8080');
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
      vm.board[serverMsg.data.row][serverMsg.data.column].value =
          getInverseSign(vm.playerInfo.playerSign);
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
    vm.isBoardFull = false;
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
    // Return true of cell1, cell2, and cell3 are the same and are not
    // emptyCell.
    if (cell1.value == emptyCell || cell2.value === emptyCell ||
        cell3.value === emptyCell)
      return false;
    return (cell1.value === cell2.value && cell2.value === cell3.value);
  }

  function isBoardFull() {
    // Return true if the board is full (no emptyCell values).
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (vm.board[row][col].value === emptyCell) {
          return false;
        }
      }
    }
    return true;
  }

  function checkWinner() {
    console.log('CHECK WINNER');
    console.log(vm.board[0][0].value);

    // Check Diagnols
    if (checkForMatch(vm.board[0][0], vm.board[1][1], vm.board[2][2])) {
      vm.winner = vm.board[1][1].value;

      console.log('Winner Found:', vm.board[1][1]);
      return true;
    }
    if (checkForMatch(vm.board[0][2], vm.board[1][1], vm.board[2][0])) {
      vm.winner = vm.board[1][1].value;
      console.log('Winner Found:', vm.board[1][1]);
      return true;
    }
    // CHECK ROWS
    for (let row = 0; row < 3; row++) {
      if (checkForMatch(vm.board[row][0], vm.board[row][1], vm.board[row][2])) {
        vm.winner = vm.board[row][0].value;
        console.log('Winner Found:', vm.board[row][0]);
        return true;
      }
    }
    // CHECK COLUMNS
    for (let col = 0; col < 3; col++) {
      if (checkForMatch(vm.board[0][col], vm.board[1][col], vm.board[2][col])) {
        vm.winner = vm.board[0][col].value;
        console.log('Winner Found:', vm.board[0][col].value);
        return true;
      }
    }
  }

  function checkForEndOfGame() {
    console.log('CHECK FOR END OF GAME');
    // Check if somebody won
    checkWinner();
    // Otherwise Board is full
    vm.isBoardFull = isBoardFull();
  }

  vm.move = function(rowIndex, columnIdex) {
    let cell = vm.board[rowIndex][columnIdex];
    cell.value = vm.playerInfo.playerSign;

    vm.playerInfo.isItMyTurn = !vm.playerInfo.isItMyTurn;
    // Send Move information to websocket server
    let moveInfo = {
      'event': 'playerMove',
      'data': {'row': rowIndex, 'column': columnIdex}
    };
    checkForEndOfGame();
    ws.send(JSON.stringify(moveInfo));
  };
});
})();