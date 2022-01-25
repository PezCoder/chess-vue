Vue.component('Board', {
  data: () => ({
    selectedPiece: null,
    pieces: [{
      type: 'king',
      color: 'black',
      x: 3,
      y: 3,
    }, {
      type: 'queen',
      color: 'black',
      x: 3,
      y: 4,
    }],
  }),
  // Index goes from 0 -> 63
  template: `
    <section class="board">
      <Square
        :key="index"
        v-for="index in (8*8)"
        @click.native="setSelectedPiece(index -1)"
        :color="getSquareColor(index - 1)"
        :piece="getPiece(index - 1)"
        :highlight="getHighlight(index -1, selectedPiece)"
        :dot="isValidMove(selectedPiece, index - 1)">
      </Square>
    </section>
  `,
  methods: {
    getPosition: index => ({ x: Math.floor(index/8), y: index % 8 }),
    isEven: number => number % 2 === 0,

    getSquareColor: function (index) {
      const { x, y } = this.getPosition(index);
      const isYEven = this.isEven(y);

      if (this.isEven(x)) {
        return isYEven ? 'light' : 'dark';
      }

      return isYEven ? 'dark' : 'light';
    },

    getPieceOnPosition: function(index) {
      const { x, y } = this.getPosition(index);
      return this.pieces.find(piece => piece.x === x && piece.y === y);
    },

    getPiece: function(index) {
      const piece = this.getPieceOnPosition(index);
      if (!piece) {
        return;
      }

      const pieceToImage = {
        'king': {
          'black': `./pieces/king-black.svg`,
        },

        'queen': {
          'black': `./pieces/queen-black.svg`,
        },
      };

      return pieceToImage[piece.type][piece.color];
    },

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
        'queen': () => {
          const isHorizontalMove = squareY === y;
          const isVerticalMove = squareX === x;
          const isDiagonalMove = Math.abs(squareX - x) === Math.abs(squareY - y);

          return isHorizontalMove || isVerticalMove || isDiagonalMove;
        }
      };

      const isNotSelf = !(x === squareX && y === squareY);
      return isNotSelf && movesToFn[type](color);
    },

    setSelectedPiece: function(index) {
      const piece = this.getPieceOnPosition(index);
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
    }
  },
});
