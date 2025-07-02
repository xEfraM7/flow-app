<template>
  <q-card
    :class="['node-card node-branch', gotoModeActive ? 'goto-highlight' : '']"
    @mouseover="hover(true)"
    @mouseleave="hover(false)"
  >
    <div
      class="node-icon warning"
      style="
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background-color: rgba(255, 193, 7, 0.15);
        flex-shrink: 0;
      "
    >
      <Icon
        icon="ion:git-network"
        style="
          transform: rotate(180deg);
          transform-origin: center;
          font-size: 24px;
          color: var(--q-warning);
        "
      />
    </div>
    <span class="node-label">{{ data.label }}</span>

    <Handle
      id="handleBranchTargetTop"
      type="target"
      :position="Position.Top"
      :style="invisibleHandle"
    />
    <Handle type="source" :position="Position.Bottom" :style="sourceHandleStyle" />
  </q-card>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { Icon } from '@iconify/vue';

defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  gotoModeActive?: boolean;
}>();

const invisibleHandle = {
  opacity: 0,
  pointerEvents: 'none',
  width: '10px',
  height: '10px',
};

const sourceHandleStyle = {
  backgroundColor: 'var(--q-warning)',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  border: '2px solid var(--q-warning)',
  boxShadow: '0 0 4px var(--q-warning)',
  zIndex: 10,
};

function hover(enter: boolean) {
  const card = document.querySelector('.node-branch');
  if (card) {
    card.setAttribute('style', `border: ${enter ? '3px' : '1px'} solid var(--q-warning)`);
  }
}
</script>
