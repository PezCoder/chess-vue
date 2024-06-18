// TODO: Square & Dot should rather be passed from the parent
Vue.component('Square', {
  props: ['color', 'highlight', 'piece', 'shape'],
  template: `<article class="square" :class="[color, { highlight: !!highlight }]">
    <img :src="piece" v-if="piece" class="piece" />
    <span class="dot" v-if="shape === 'dot'" />
    <span class="circle" v-if="shape === 'circle'" />
  </article>`
});
