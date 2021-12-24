Vue.component('Board', {
  data: () => ({
    pieces: [{
      type: 'king',
      color: 'black',
      x: 3,
      y: 3,
    }]
  }),
  // Index goes from 0 -> 63
  template: `
    <section class="board">
      <Square
        v-for="index in (8*8)"
        :color="getSquareColor(index - 1)"
        :key="index"
        :piece="getPiece(index - 1)">
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

    getPieceOnPosition: function(x, y) {
      return this.pieces.find(piece => piece.x === x && piece.y === y);
    },

    getPiece: function(index) {
      const { x, y } = this.getPosition(index);
      const piece = this.getPieceOnPosition(x, y);
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

    moves: function({ x, y, type, color }) {
      const movesToFn = {
        'king': () => [[x+1, y], [x-1, y], [x, y+1], [x, y-1]],
      };

      return movesToFn(type)(color);
    }
  },
});
