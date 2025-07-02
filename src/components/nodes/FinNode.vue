<template>
  <q-card
    class="node-card node-fin"
    :class="{ 'fin-highlight': data.highlightGoto || data.connectedNodeType }"
    style="display: flex; align-items: center; justify-content: center; flex-direction: column"
  >
    <!-- Conectado a SIMPLE -->
    <template v-if="data.connectedNodeType === 'simple'">
      <Icon
        style="font-size: 24px; color: var(--q-positive)"
        icon="mdi:file-document-multiple-outline"
      />
    </template>

    <!-- Conectado a BRANCH -->
    <template v-else-if="data.connectedNodeType === 'branch'">
      <Icon
        icon="ion:git-network"
        style="
          transform: rotate(180deg);
          transform-origin: center;
          font-size: 24px;
          color: var(--q-warning);
        "
      />
    </template>

    <!-- Modo normal -->
    <template v-else>
      {{ data.label }}
    </template>
  </q-card>

  <Handle id="handleEndTargetTop" type="target" :position="Position.Top" :style="hiddenHandle" />
  <Handle type="source" :position="Position.Bottom" :style="hiddenHandle" />
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { Icon } from '@iconify/vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{ data: any }>();

const hiddenHandle = {
  opacity: 0,
  pointerEvents: 'none',
  width: '10px',
  height: '10px',
};
</script>

<style scoped>
.fin-highlight {
  background-color: white;
  border: 2px solid #ccc;
  border-radius: 20px;
}
</style>
