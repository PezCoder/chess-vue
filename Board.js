Vue.component('Board', {
  template: `
    <section class="board">
      <Square v-for="index in (8*8)" :color="getSquareColor(index - 1)" :key="index"></Square>
    </section>
  `,
  methods: {
    // Index goes from 0 -> 63
    getSquareColor: function (index) {
      const { row, col } = this.getRowCol(index);
      console.log(row, col);
      const isColEven = this.isEven(col);

      if (this.isEven(row)) {
        return isColEven ? 'light' : 'dark';
      }

      return isColEven ? 'dark' : 'light';
    },
    getRowCol: index => ({ row: Math.floor(index/8), col: index % 8 }),
    isEven: number => number % 2 === 0,
  }
});
