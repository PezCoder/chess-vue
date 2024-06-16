const BOARD_ROWS = 8;
const BOARD_COLS = 8;
const BOARD_SQUARES = BOARD_ROWS * BOARD_COLS;

Vue.component('Board', {
  data: () => ({
    selectedPiece: null,
    pieces: [{
      type: 'rook',
      color: 'black',
      x: 0,
      y: 0,
    }, {
      type: 'rook',
      color: 'white',
      x: 0,
      y: 7,
    }, {
      type: 'queen',
      color: 'white',
      x: 2,
      y: 0,
    }, {
      type: 'queen',
      color: 'black',
      x: 7,
      y: 7,
    }, {
      type: 'king',
      color: 'white',
      x: 4,
      y: 7,
    }, {
      type: 'king',
      color: 'black',
      x: 2,
      y: 4,
    }, {
      type: 'pawn',
      color: 'black',
      x: 0,
      y: 2,
    }, {
      type: 'pawn',
      color: 'white',
      x: 7,
      y: 6,
    }],
  }),
  // Index goes from 0 -> 63
  template: `
    <section class="board">
      <Square
        :key="index"
        v-for="index in (${BOARD_SQUARES})"
        @click.native="setSelectedPiece(index -1)"
        :color="getSquareColor(index - 1)"
        :piece="getPiece(index - 1)"
        :highlight="getHighlight(index -1, selectedPiece)"
        :dot="shouldDrawDot(index - 1, dots)">
      </Square>
    </section>
  `,
  methods: {
    getPosition: index => ({ y: Math.floor(index/BOARD_ROWS), x: index % BOARD_COLS }),
    isEven: number => number % 2 === 0,

    getSquareColor: function (index) {
      const { x, y } = this.getPosition(index);
      const isYEven = this.isEven(y);

      if (this.isEven(x)) {
        return isYEven ? 'light' : 'dark';
      }

      return isYEven ? 'dark' : 'light';
    },

    getPieceForPosition: function({ x, y }) {
      return this.pieces.find(piece => piece.x === x && piece.y === y);
    },

    getPieceForIndex: function(index) {
      return this.getPieceForPosition(this.getPosition(index));
    },

    getPiece: function(index) {
      const piece = this.getPieceForIndex(index);
      if (!piece) {
        return;
      }

      const pieceToImage = {
        'king': {
          'black': `./pieces/king-black.svg`,
          'white': `./pieces/king-white.svg`,
        },

        'queen': {
          'black': `./pieces/queen-black.svg`,
          'white': `./pieces/queen-white.svg`,
        },

        'rook': {
          'black': `./pieces/rook-black.svg`,
          'white': `./pieces/rook-white.svg`,
        },

        'bishop': {
          'black': `./pieces/bishop-black.svg`,
          'white': `./pieces/bishop-white.svg`,
        },

        'knight': {
          'black': `./pieces/knight-black.svg`,
          'white': `./pieces/knight-white.svg`,
        },

        'pawn': {
          'black': `./pieces/pawn-black.svg`,
          'white': `./pieces/pawn-white.svg`,
        },
      };

      return pieceToImage[piece.type][piece.color];
    },

    // TODO: Remove this if not needed
    // This was the older appraoch I tried where I loop through the board to figure out if for the selected piece the move is valid
    // This currently makes it difficult to detect pieces obstructing
    isValidMove: function(selectedPiece, index) {
      if (!selectedPiece) {
        return false;
      }

      const { x: squareX, y: squareY } = this.getPosition(index);
      const { x, y, type, color } = selectedPiece;

      const movesToFn = {
        'king': () => {
          const isOnLeftOrRight = Math.abs(squareX - x) === 1 && squareY === y;
          const isOnUpOrDown = Math.abs(squareY - y) === 1 && squareX === x;

          return isOnLeftOrRight || isOnUpOrDown;
        },

        'queen': function() {
          return this.rook() || this.bishop();
        },

        'rook': () => {
          const isHorizontalMove = squareY === y;
          const isVerticalMove = squareX === x;

          return isHorizontalMove || isVerticalMove;
        },

        'bishop': () => {
          const isDiagonalMove = Math.abs(squareX - x) === Math.abs(squareY - y);

          return isDiagonalMove;
        },

        'knight': () => {
          const xDiff = Math.abs(squareX - x);
          const yDiff = Math.abs(squareY - y);
          const isMovingVertically = yDiff === 2 && xDiff === 1;
          const isMovingHorizontally = xDiff === 2 && yDiff === 1;

          return isMovingVertically || isMovingHorizontally;
        },

        'pawn': (color) => {
          const sameX = squareX === x;
          if (color === 'white') {
            const movingUp = y - 1 === squareY;

            return movingUp && sameX;
          }

          const movingDown = y + 1 === squareY;
          return movingDown && sameX;
        },
      };

      const isNotSelf = !(x === squareX && y === squareY);
      return isNotSelf && movesToFn[type](color);
    },

    setSelectedPiece: function(index) {
      const piece = this.getPieceForIndex(index);
      // Reset when clicked on a blank square or the same piece again
      if (!piece || this.selectedPiece === piece) {
        this.selectedPiece = null;
        return;
      }

      // First time clicking on a piece or
      // Clicked on another piece when one is already selected
      this.selectedPiece = piece;
    },

    getHighlight: function(index, selectedPiece) {
      if (!selectedPiece) {
        return false;
      }

      const { x, y } = this.getPosition(index);
      if (x === selectedPiece.x && y === selectedPiece.y) {
        return true;
      }
    },

    isOutOfBounds: function({ x, y }) {
      return x < 0 || x >= BOARD_COLS || y < 0 || y >= BOARD_ROWS;
    },

    traverse: function(position, newPositionFn, callback, breakingCondition = () => false) {
      let newPosition = newPositionFn(position);
      if (this.isOutOfBounds(newPosition)
        || this.breakWhenPieceOnPosition(newPosition)
        || breakingCondition(newPosition)) {
        return;
      }

      callback(newPosition);
      this.traverse(newPosition, newPositionFn, callback, breakingCondition);
    },

    traverseDiagonally: function(position, fn) {
      this.traverse(position, ({ x, y }) => ({ x: x + 1, y: y + 1 }), fn);
      this.traverse(position, ({ x, y }) => ({ x: x - 1, y: y - 1 }), fn);
      this.traverse(position, ({ x, y }) => ({ x: x - 1, y: y + 1 }), fn);
      this.traverse(position, ({ x, y }) => ({ x: x + 1, y: y - 1 }), fn);
    },

    breakIfDistanceGreaterThan: function(oldPosition, newPosition, distance) {
      return Math.abs(oldPosition.x - newPosition.x) > distance
        || Math.abs(oldPosition.y - newPosition.y) > distance;
    },

    breakWhenPieceOnPosition: function(position) {
      return !!this.getPieceForPosition(position);
    },

    traverseHorizontally: function(position, fn, breakingCondition) {
      this.traverse(position, ({ x, y }) => ({ x: x + 1, y }), fn, breakingCondition);
      this.traverse(position, ({ x, y }) => ({ x: x - 1, y }), fn, breakingCondition);
    },

    traverseVerticallyDown: function(position, fn, breakingCondition) {
      this.traverse(position, ({ x, y }) => ({ x, y: y + 1 }), fn, breakingCondition);
    },

    traverseVerticallyUp: function(position, fn, breakingCondition) {
      this.traverse(position, ({ x, y }) => ({ x, y: y - 1 }), fn, breakingCondition);
    },

    traverseVertically: function(position, fn, breakingCondition) {
      this.traverseVerticallyDown(position, fn, breakingCondition);
      this.traverseVerticallyUp(position, fn, breakingCondition);
    },

    shouldDrawDot: function(index, dots) {
      const position = this.getPosition(index);
      return dots.some(({ x,y }) => position.x === x && position.y === y);
    },

    traverseByPiece: function(piece, fn) {
      // TODO: Finish more piece types
      switch(piece.type) {
        case 'rook': {
          this.traverseHorizontally(piece, fn);
          this.traverseVertically(piece, fn);
          break;
        }

        case 'bishop': {
          this.traverseDiagonally(piece, fn);
          break;
        }

        case 'queen': {
          this.traverseByPiece({
            ...piece,
            type: 'rook',
          }, fn);
          this.traverseByPiece({
            ...piece,
            type: 'bishop',
          }, fn);
          break;
        }

        case 'king': {
          this.traverseHorizontally(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          this.traverseVertically(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          break;
        }

        case 'pawn': {
          if (piece.color === 'white') {
            this.traverseVerticallyUp(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          } else {
            this.traverseVerticallyDown(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          }

          break;
        }

        case 'knight': {
          if (piece.color === 'white') {
            this.traverseVerticallyUp(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          } else {
            this.traverseVerticallyDown(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          }

          break;
        }
      }
    },
  },


  /*
   * How to draw dots?
   * Knight, King, Pawn - All valid except it's own piece is on the landing position
   * Bishop - All valid till a piece is encountered diagonally
   * Rook - All valid till a piece is encountered horizontall/vertically
   * Queen - Bishop + rook
  */
  computed: {
    dots: function() {
      const data = [];

      if (!this.selectedPiece) {
        return data;
      }

      this.traverseByPiece(this.selectedPiece, position => data.push(position));

      return data;
    }
  },
});
