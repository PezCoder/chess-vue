Vue.component('Square', {
  props: ['color', 'highlight', 'piece'],
  template: `<article class="square" :class="[color, { highlight: !!highlight }]">
    <img :src="piece" v-if="!!piece" class="piece" />
  </article>`
});
