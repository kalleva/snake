function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createMatrix(x, y) {
  var matrix = [];
  for (var i = 0; i < x; i++) {
    var row = [];
    for (var j = 0; j < y; j++) {
      row[j] = 0;
    }
    matrix[i] = row;
  }
  return matrix;
}

function drawPlane(state) {
  var plane = document.getElementsByClassName('plane')[0];
  for (var i = 0; i < state.matrix.length; i++) {
    var row = document.createElement('div');
    row.classList.add('row');
    for (var j = 0; j < state.matrix[0].length; j++) {
      var cell = document.createElement('div');
      cell.classList.add('cell');
      if (state.matrix[i][j] === 0) {
        cell.classList.add('field');
      } else if (state.matrix[i][j] === 1) {
        cell.classList.add('snake');
      } else if (state.matrix[i][j] === 2) {
        cell.classList.add('food');
      }
      row.appendChild(cell);
    }
    plane.appendChild(row);
  }
}

function applyChangesToPlane(state) {
  var plane = document.getElementsByClassName('plane')[0];
  var rows = plane.children;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i].children;
    for (var j = 0; j < row.length; j++) {
      if (row[j].classList.contains('field') && state.matrix[i][j] !== 0) {
        row[j].classList.remove('field');
        if (state.matrix[i][j] === 1) {
          row[j].classList.add('snake');
        } else if (state.matrix[i][j] === 2) {
          row[j].classList.add('food');
        }
      } else if (row[j].classList.contains('snake') && state.matrix[i][j] !== 1) {
        row[j].classList.remove('snake');
        if (state.matrix[i][j] === 0) {
          row[j].classList.add('field');
        } else if (state.matrix[i][j] === 2) {
          row[j].classList.add('food');
        }
      } else if (row[j].classList.contains('food') && state.matrix[i][j] !== 2) {
        row[j].classList.remove('food');
        if (state.matrix[i][j] === 0) {
          row[j].classList.add('field');
        } else if (state.matrix[i][j] === 1) {
          row[j].classList.add('snake');
        }
      }
    }
  }
}

function createFood(matrix) {
  while (true) {
    var x = getRandomIntInclusive(0, matrix.length - 1);
    var y = getRandomIntInclusive(0, matrix[0].length - 1);
    if (matrix[x][y] === 0) {
      matrix[x][y] = 2;
      break;
    }
  }
  return [x, y];
}

function createSnake(matrix) {
  while (true) {
    var x = getRandomIntInclusive(0, matrix.length - 1);
    var y = getRandomIntInclusive(0, matrix[0].length - 1);
    if (matrix[x][y] === 0) {
      matrix[x][y] = 1;
      break;
    }
  }
  return [[x, y]];
}

function removeFoodAndSnake(state) {
  for(var j = 0; j < state.snake.length; j++) {
    state.matrix[state.snake[j][0]][state.snake[j][1]] = 0;
  }
  state.matrix[state.foodLocation[0]][state.foodLocation[1]] = 0;
}

function isCloserToFood(x, y, z) {
  return Math.hypot(z[0] - x[0], z[1] - x[1]) <
    Math.hypot(z[0] - y[0], z[1] - y[1]);
}

//determines if valid point in matrix
function isValidPlace(matrix, x, y) {
  return x < matrix.length && y < matrix[0].length && x >= 0 && y >= 0;
}

function isValidMove(matrix, x, y, dx, dy) {
  var N = 10;
  var j, dontHaveSnakeAheadInNBlocks = true;
  //determines if valid point in matrix and is not snake
  var result = isValidPlace(matrix, x, y) && matrix[x][y] !== 1;
  //it's generally a good idea to avoid selfmade 1 point in width tunnels
  if (result) {
    if (dx !== 0) {
      result = (isValidPlace(matrix, x, y - 1) && matrix[x][y - 1] === 0) ||
               (isValidPlace(matrix, x, y + 1) && matrix[x][y + 1] === 0);
    }
    if (dy !== 0) {
      result = (isValidPlace(matrix, x - 1, y) && matrix[x - 1][y] === 0) ||
               (isValidPlace(matrix, x + 1, y) && matrix[x + 1][y] === 0);
    }

    //trying to avoid routes with snake ahead
    if (dx === -1) {
      for (j = x + dx; j >= x + dx - N; j--) {
        if (j < 0) {
          break;
        }
        if (matrix[j][y] === 1) {
          dontHaveSnakeAheadInNBlocks = false;
        }
      }
      result = result && dontHaveSnakeAheadInNBlocks;
    }

    if (dx === 1) {
      for (j = x + dx; j <= x + dx + N; j++) {
        if (j >= matrix.length) {
          break;
        }
        if (matrix[j][y] === 1) {
          dontHaveSnakeAheadInNBlocks = false;
        }
      }
      result = result && dontHaveSnakeAheadInNBlocks;
    }

    if (dy === -1) {
      for (j = y + dy; j >= y + dy - N; j--) {
        if (j < 0) {
          break;
        }
        if (matrix[x][j] === 1) {
          dontHaveSnakeAheadInNBlocks = false;
        }
      }
      result = result && dontHaveSnakeAheadInNBlocks;
    }

    if (dy === 1) {
      for (j = y + dy; j <= y + dy + N; j++) {
        if (j >= matrix[0].length) {
          break;
        }
        if (matrix[x][j] === 1) {
          dontHaveSnakeAheadInNBlocks = false;
        }
      }
      result = result && dontHaveSnakeAheadInNBlocks;
    }
  }

  return result;
}


function moveSnake(state){
  var j, tail, possibleMoves = [];

  if (isValidMove(state.matrix, state.snake[0][0] + 1,
                   state.snake[0][1], 1, 0)) {
    possibleMoves.push([state.snake[0][0] + 1, state.snake[0][1]]);
  }
  if (isValidMove(state.matrix, state.snake[0][0],
                   state.snake[0][1] + 1, 0, 1)) {
    possibleMoves.push([state.snake[0][0], state.snake[0][1] + 1]);
  }
  if (isValidMove(state.matrix, state.snake[0][0] - 1,
                   state.snake[0][1], -1, 0)) {
    possibleMoves.push([state.snake[0][0] - 1, state.snake[0][1]]);
  }
  if (isValidMove(state.matrix, state.snake[0][0],
                   state.snake[0][1] - 1, 0, -1)) {
    possibleMoves.push([state.snake[0][0], state.snake[0][1] - 1]);
  }

  for(j = 0; j < possibleMoves.length; j++) {
    if (isCloserToFood(possibleMoves[j], state.snake[0], state.foodLocation)) {
      state.snake.unshift([possibleMoves[j][0],possibleMoves[j][1]]);
      break;
    }
  }

  if (possibleMoves.length === 0)
  {
    console.log('Game Over!');
    console.log(state.snake.length);
    removeFoodAndSnake(state);
    state.snake = createSnake(state.matrix);
    state.foodLocation = createFood(state.matrix);
    return;
  }

  if (j === possibleMoves.length) {
    state.snake.unshift([possibleMoves[0][0],possibleMoves[0][1]]);
  }
  if (state.snake[0][0] === state.foodLocation[0] &&
      state.snake[0][1] === state.foodLocation[1]) {
    state.shouldGrow = true;
    state.foodLocation = createFood(state.matrix);
  }
  if (!state.shouldGrow) {
    tail = state.snake.pop();
    state.matrix[tail[0]][tail[1]] = 0;
  } else {
    state.shouldGrow = false;
  }

  for (var i = 0; i < state.snake.length; i++) {
    state.matrix[state.snake[i][0]][state.snake[i][1]] = 1;
  }
  applyChangesToPlane(state);
}

var state = {
  'matrix': createMatrix(50, 50),
  'shouldGrow': false
};
state.snake = createSnake(state.matrix);
state.foodLocation = createFood(state.matrix);
drawPlane(state);
setInterval(moveSnake, 10, state);
