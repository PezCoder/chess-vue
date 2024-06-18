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
      type: 'queen',
      color: 'white',
      x: 2,
      y: 0,
    }, {
      type: 'pawn',
      color: 'black',
      x: 0,
      y: 2,
    }, {
      type: 'knight',
      color: 'white',
      x: 2,
      y: 4,
    }, {
      type: 'knight',
      color: 'white',
      x: 4,
      y: 3,
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
        :shape="getShape(index - 1, moves)">
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

    traverse: function(
      position,
      newPositionFn,
      callback,
      breakingCondition = () => false,
      shouldRecurse = true
    ) {
      let newPosition = newPositionFn(position);

      console.log(newPosition, this.isMyPieceOnPosition(newPosition));
      if (this.isOutOfBounds(newPosition)
        // If it's my own piece, break immediately, if opponent piece callback should be called
        || this.isMyPieceOnPosition(newPosition)
        || breakingCondition(newPosition)) {
        return;
      }

      if (newPosition.x === 0 & newPosition.y === 2) {
        console.log(newPosition);
      }
      callback(newPosition);

      // Traverse only if no piece on the way
      if (shouldRecurse && !this.getPieceForPosition(newPosition)) {
        this.traverse(newPosition, newPositionFn, callback, breakingCondition);
      }
    },

    // uses traverse but with no recursion since it's a jump
    jumpTo: function(piece, newPositionFn, fn) {
      this.traverse(
        piece,
        newPositionFn,
        fn,
        () => false,
        false,
      );
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

    isMyPieceOnPosition: function(position) {
      return this.getPieceForPosition(position)?.color === this.selectedPiece?.color;
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

    isOpponentsPieceOnPosition: function(position) {
      const pieceOnPosition = this.getPieceForPosition(position);
      return pieceOnPosition && pieceOnPosition.color !== this.selectedPiece?.color;
    },

    getShape: function(index, moves) {
      const position = this.getPosition(index);
      const canMove = moves.some(({ x,y }) => position.x === x && position.y === y);
      if (!canMove) {
        return null;
      }

      const canCapture = this.isOpponentsPieceOnPosition(position);
      return canCapture ? 'circle' : 'dot';
    },

   /**
     * Knight, King, Pawn - All valid except it's own piece is on the landing position
     * Bishop - All valid till a piece is encountered diagonally
     * Rook - All valid till a piece is encountered horizontall/vertically
     * Queen - Bishop + rook
     */
    traverseByPiece: function(piece, fn) {
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

        // TODO: Pawn can also move 2 steps first move
        // TODO: Pawn can also move diagonally to kill
        case 'pawn': {
          if (piece.color === 'white') {
            this.traverseVerticallyUp(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          } else {
            this.traverseVerticallyDown(piece, fn, position => this.breakIfDistanceGreaterThan(piece, position, 1));
          }

          break;
        }

        case 'knight': {
          const positionFns = [
            ({ x,y }) => ({ x: x-2, y: y-1 }),
            ({ x,y }) => ({ x: x-2, y: y+1 }),
            ({ x,y }) => ({ x: x+2, y: y+1 }),
            ({ x,y }) => ({ x: x+2, y: y-1 }),
            ({ x,y }) => ({ x: x+1, y: y+2 }),
            ({ x,y }) => ({ x: x-1, y: y+2 }),
            ({ x,y }) => ({ x: x+1, y: y-2 }),
            ({ x,y }) => ({ x: x-1, y: y-2 }),
          ];
          positionFns.forEach(positionFn => this.jumpTo(piece, positionFn, fn));
          break;
        }
      }
    },
  },


  computed: {
    moves: function() {
      const data = [];

      if (!this.selectedPiece) {
        return data;
      }

      this.traverseByPiece(
        this.selectedPiece,
        position => data.push(position)
      );
      return data;
    }
  },
});
