<template>
  <q-card
    class="node-card node-simple"
    :class="{ 'goto-highlight': props.gotoModeActive }"
    @mouseover="hoverIn"
    @mouseleave="hoverOut"
  >
    <Icon class="node-icon positive" icon="mdi:file-document-multiple-outline" />
    <span class="node-label">{{ props.data.label }}</span>
    <Handle
      id="handleSimpleTargetTop"
      type="target"
      :position="Position.Top"
      :style="handleTargetStyle"
    />
    <Handle type="source" :position="Position.Bottom" :style="handleSourceStyle" />
  </q-card>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { Icon } from '@iconify/vue';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const props = defineProps<{ data: any; gotoModeActive: boolean }>();

const handleTargetStyle = {
  opacity: 0,
  pointerEvents: 'none',
  width: '10px',
  height: '10px',
};

const handleSourceStyle = {
  backgroundColor: 'var(--q-positive)',
  width: '12px',
  height: '12px',
  borderRadius: '6px',
  border: '2px solid var(--q-positive)',
  boxSizing: 'border-box',
  zIndex: 10,
};

function hoverIn(e: MouseEvent) {
  (e.currentTarget as HTMLElement).style.border = '3px solid var(--q-positive)';
}
function hoverOut(e: MouseEvent) {
  (e.currentTarget as HTMLElement).style.border = '1px solid var(--q-positive)';
}
</script>
