<script setup lang="ts">
defineProps<{
  piece: string
  color: string
  shape?: 'dot' | 'circle'
  highlight?: boolean
}>()
</script>

<template>
  <article class="square" :class="[color, { highlight: !!highlight }]">
    <img :src="piece" v-if="piece" class="piece" />
    <span class="dot" v-if="shape === 'dot'" />
    <span class="circle" v-if="shape === 'circle'" />
  </article>
</template>
