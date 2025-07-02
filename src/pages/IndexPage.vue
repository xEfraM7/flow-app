<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Handle, VueFlow, Position } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import type { Node } from '@vue-flow/core';
import { Icon } from '@iconify/vue';

import { useFlowNodes } from 'src/composables/useFlowNodes';
import NodeEditDrawer from 'src/components/drawers/NodeEditDrawer.vue';
import NodeCreationDrawer from 'src/components/drawers/NodeCreationDrawer.vue';
import { MiniMap } from '@vue-flow/minimap';
import { Controls, ControlButton } from '@vue-flow/controls';

const { initialNodes, addDefaultNode, initInitialNodes, edges, addBranchNode, getConnectedNodes } =
  useFlowNodes();

const creationDrawerOpen = ref(false);
const clickedAddNodeId = ref<string | null>(null);

const drawerOpen = ref(false);
const selectedNode = ref<Node | null>(null);
const selectedBranchChildren = ref<Node[]>([]);

const gotoSourceId = ref<string | null>(null);
const gotoModeActive = computed(() => gotoSourceId.value !== null);

function onNodeClick({ node }: { node: Node }) {
  if (gotoSourceId.value) {
    if (['simple', 'branch'].includes(node.type ?? '')) {
      edges.value.push({
        id: `e-${gotoSourceId.value}->${node.id}`,
        source: gotoSourceId.value,
        target: node.id,
        animated: true,
        markerEnd: 'arrowclosed',
      });
    } else {
      alert('❌ Solo puedes conectar a nodos de tipo simple o branch.');
    }

    gotoSourceId.value = null; // salir del modo ir a
    return;
  }

  // resto de comportamiento...
  if (node.type === 'add') {
    clickedAddNodeId.value = node.id;
    creationDrawerOpen.value = true;
    return;
  }

  const nonEditableTypes = ['inicio', 'fin', 'branchWithoutIcon'];
  if (!node.type || nonEditableTypes.includes(node.type)) return;

  selectedNode.value = node;

  if (node.type === 'branch') {
    const connected = getConnectedNodes(node.id);
    const filtered = connected.filter((n) => n.type !== 'add' && n.type !== 'fin');
    selectedBranchChildren.value = filtered;
  } else {
    selectedBranchChildren.value = [];
  }

  drawerOpen.value = true;
}

function onSelectNodeType(type: 'simple' | 'branch' | 'goto') {
  const index = initialNodes.value.findIndex((n) => n.id === clickedAddNodeId.value);
  if (index === -1) return;

  if (type === 'simple') {
    addDefaultNode(index);
  } else if (type === 'branch') {
    addBranchNode(index);
  } else if (type === 'goto') {
    const clickedAddNode = initialNodes.value[index];
    if (!clickedAddNode || clickedAddNode.type !== 'add') {
      alert('❌ Nodo "crear" no válido');
      return;
    }

    // Buscar el nodo fin más cercano después del "add" clickeado
    const finNode = initialNodes.value.slice(index + 1).find((n) => {
      return n.type === 'fin' && !edges.value.some((edge) => edge.source === n.id);
    });

    if (!finNode) {
      alert('❌ No se encontró un nodo fin disponible después del nodo crear');
    } else {
      gotoSourceId.value = finNode.id;
    }
  }

  clickedAddNodeId.value = null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onSaveNodeLabel(payload: any) {
  if (payload.type === 'simple') {
    const node = initialNodes.value.find((n) => n.id === payload.id);
    if (node) node.data.label = payload.label;
  } else if (payload.type === 'branch') {
    const node = initialNodes.value.find((n) => n.id === payload.id);
    const [child1, child2] = payload.childIds.map((id: string) =>
      initialNodes.value.find((n) => n.id === id),
    );

    if (node) node.data.label = payload.mainLabel;
    if (child1) child1.data.label = payload.childLabels[0];
    if (child2) child2.data.label = payload.childLabels[1];
  }
}

function updatePos() {
  initialNodes.value = initialNodes.value.map((node) => {
    return {
      ...node,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };
  });
}

function handleBranchHoverIn(e: MouseEvent) {
  (e.currentTarget as HTMLElement).style.border = '3px solid var(--q-warning)';
}

function handleBranchHoverOut(e: MouseEvent) {
  (e.currentTarget as HTMLElement).style.border = '1px solid var(--q-warning)';
}

onMounted(() => {
  initInitialNodes();
});
</script>

<template>
  <VueFlow
    :nodes="initialNodes"
    :edges="edges"
    style="width: 100%; height: 100vh"
    @node-click="onNodeClick"
  >
    <Background variant="dots" :gap="10" :size="1" pattern-color="#ccc" />

    <!-- NODO: INICIO -->
    <template #node-inicio="{ data }">
      <q-card class="node-card node-inicio">
        {{ data.label }}
      </q-card>
    </template>

    <!-- NODO: ADD -->
    <template #node-add="{ data }">
      <q-card class="node-card node-add">
        {{ data.label }}
      </q-card>
    </template>

    <!-- NODO: SIMPLE -->
    <template #node-simple="{ data }">
      <q-card
        :class="['node-card node-simple', gotoModeActive ? 'goto-highlight' : '']"
        class="node-card node-simple"
        @mouseover="
          (e: MouseEvent) =>
            ((e.currentTarget as HTMLElement).style.border = '3px solid var(--q-positive)')
        "
        @mouseleave="
          (e: MouseEvent) =>
            ((e.currentTarget as HTMLElement).style.border = '1px solid var(--q-positive)')
        "
      >
        <Icon class="node-icon positive" icon="mdi:file-document-multiple-outline" />
        <span class="node-label">{{ data.label }}</span>
      </q-card>
      <Handle
        id="handleSimpleTargetTop"
        type="target"
        :position="Position.Top"
        :style="{
          opacity: 0,
          pointerEvents: 'none',
          width: '10px',
          height: '10px',
        }"
      />
      <Handle type="source" :position="Position.Bottom" />
    </template>

    <!-- NODO: BRANCH -->
    <template #node-branch="{ data }">
      <q-card
        :class="['node-card node-simple', gotoModeActive ? 'goto-highlight' : '']"
        class="node-card node-branch"
        @mouseover="handleBranchHoverIn"
        @mouseleave="handleBranchHoverOut"
      >
        <Icon class="node-icon warning" icon="mdi:source-branch" />
        <span class="node-label">{{ data.label }}</span>
      </q-card>
      <Handle
        id="handleBranchTargetTop"
        type="target"
        :position="Position.Top"
        :style="{
          opacity: 0,
          pointerEvents: 'none',
          width: '10px',
          height: '10px',
        }"
      />
      <Handle type="source" :position="Position.Bottom" />
    </template>

    <!-- NODO: BRANCH SIN ÍCONO -->
    <template #node-branchWithoutIcon="{ data }">
      <q-card
        class="node-card node-branch"
        @mouseover="handleBranchHoverIn"
        @mouseleave="handleBranchHoverOut"
      >
        <span class="node-label">{{ data.label }}</span>
      </q-card>
    </template>

    <!-- NODO: FIN -->
    <template #node-fin="{ data }">
      <q-card class="node-card node-fin">
        {{ data.label }}
      </q-card>
      <Handle
        id="handleEndTargetTop"
        type="target"
        :position="Position.Top"
        :style="{
          opacity: 0,
          pointerEvents: 'none',
          width: '10px',
          height: '10px',
        }"
      />
      <Handle
        type="source"
        :position="Position.Bottom"
        :style="{
          opacity: 0,
          pointerEvents: 'none',
          width: '10px',
          height: '10px',
        }"
      />
    </template>

    <!-- Extras -->
    <MiniMap position="bottom-right" />
    <Controls position="top-left">
      <ControlButton title="Randomize" @click="updatePos">🎲</ControlButton>
    </Controls>
  </VueFlow>

  <!-- Drawers -->
  <NodeEditDrawer
    v-model="drawerOpen"
    :node="selectedNode"
    :children="selectedBranchChildren"
    @save="onSaveNodeLabel"
  />

  <NodeCreationDrawer v-model="creationDrawerOpen" @select="onSelectNodeType" />
</template>
