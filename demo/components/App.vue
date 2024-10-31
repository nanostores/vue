<template>
  <div id="view">
    <logo />
    <with-stores v-if="isStoresMounted" />
    <button @click="executeTest">
      Execute Test
    </button>
    <button @click="toggleStores">
      {{ isStoresMounted ? 'Unmount' : 'Mount' }} Stores
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import Logo from './Logo.vue'
import WithStores from './WithStores.vue';

import { run } from '../stores.js'

const isStoresMounted = ref(false)

function executeTest() {
  run()
}

function toggleStores() {
  isStoresMounted.value = !isStoresMounted.value
}
</script>

<style scoped>
#view {
  display: grid;
  gap: 1rem;
}
</style>
