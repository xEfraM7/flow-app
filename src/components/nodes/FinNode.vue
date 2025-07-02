<template>
  <q-card class="node-card node-fin">
    {{ data.label }}
  </q-card>
  <Handle id="handleEndTargetTop" type="target" :position="Position.Top" :style="hiddenHandle" />
  <Handle type="source" :position="Position.Bottom" :style="hiddenHandle" />
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ data: any }>();

const hiddenHandle = {
  opacity: 0,
  pointerEvents: 'none',
  width: '10px',
  height: '10px',
};
</script>
