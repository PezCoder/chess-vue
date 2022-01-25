// TODO: Square & Dot should rather be passed from the parent
Vue.component('Square', {
  props: ['color', 'highlight', 'piece', 'dot'],
  template: `<article class="square" :class="[color, { highlight: !!highlight }]">
    <img :src="piece" v-if="piece" class="piece" />
    <span class="dot" v-if="dot" />
  </article>`
});
