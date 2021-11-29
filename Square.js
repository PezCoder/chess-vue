Vue.component('Square', {
  props: ['color', 'highlight'],
  template: `<article class="square" v-bind:class="[color, { highlight: !!highlight }]">
    <slot></slot>
  </article>`
});
