<template>
  <q-card class="node-card node-inicio">
    {{ data.label }}
  </q-card>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ data: any }>();
</script>
