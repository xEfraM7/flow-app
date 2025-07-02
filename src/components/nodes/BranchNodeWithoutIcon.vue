<template>
  <q-card class="node-card node-branch" @mouseover="hover(true)" @mouseleave="hover(false)">
    <span class="node-label">{{ data.label }}</span>
  </q-card>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ data: any }>();

function hover(enter: boolean) {
  const card = document.querySelector('.node-branch');
  if (card) {
    card.setAttribute('style', `border: ${enter ? '3px' : '1px'} solid var(--q-warning)`);
  }
}
</script>
