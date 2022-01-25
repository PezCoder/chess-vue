Vue.component('Board', {
  data: () => ({
    selectedPiece: null,
    pieces: [{
      type: 'king',
      color: 'black',
      x: 3,
      y: 3,
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
        :dot="getDot(index - 1, moves)">
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
      };

      return pieceToImage[piece.type][piece.color];
    },

    getDot: function(index, moves) {
      if (!moves) { return false; }

      const { x, y } = this.getPosition(index);
      return moves.find(move => move[0] === x && move[1] === y);
    },

    movesForPiece: function({ x, y, type, color }) {
      const movesToFn = {
        'king': () => [[x+1, y], [x-1, y], [x, y+1], [x, y-1]],
      };

      return movesToFn[type](color);
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

  computed: {
    moves: function() {
      if (!this.selectedPiece) {
        return;
      }

      return this.movesForPiece(this.selectedPiece);
    }
  }
});
