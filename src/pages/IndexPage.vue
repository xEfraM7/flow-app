<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import type { Node } from '@vue-flow/core';
import { Icon } from '@iconify/vue';

import { useFlowNodes } from 'src/composables/useFlowNodes';
// import { useFlowEdges } from 'src/composables/useFlowEdges';
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

function onNodeClick({ node }: { node: Node }) {
  // 👇 Si es tipo "add", abre el drawer de creación
  if (node.type === 'add') {
    clickedAddNodeId.value = node.id;
    creationDrawerOpen.value = true;
    return;
  }

  // 👇 Tipos no editables
  const nonEditableTypes = ['inicio', 'fin', 'branchWithoutIcon'];
  const type = node.type;

  if (!type || nonEditableTypes.includes(type)) return;

  selectedNode.value = node;

  // 👇 Si es tipo "branch", obtenemos sus hijos conectados (excepto add y fin)
  if (type === 'branch') {
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
    addBranchNode(index); // ✅ ya listo para usarse
  } else if (type === 'goto') {
    alert('🚧 Paso "ir a" no implementado todavía');
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

    <!-- nodo-inicio -->
    <template #node-inicio="{ data }">
      <q-card
        class="bg-green-4 text-white text-center content-center"
        style="min-width: 80px; border-radius: 10px; min-height: 40px"
      >
        {{ data.label }}
      </q-card>
    </template>

    <!-- nodo-anadir -->
    <template #node-add="{ data }">
      <q-card
        class="bg-white text-grey-8 text-center text-h4"
        style="
          min-width: 40px;
          border-radius: 20px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        {{ data.label }}
      </q-card>
    </template>

    <!-- nodo-simple -->
    <template #node-simple="{ data }">
      <q-card
        class="text-dark"
        style="
          min-width: 300px;
          min-height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--q-positive);
          transition: border 0.2s ease-in-out;
          position: relative;
          padding: 0 12px;
        "
        @mouseover="
          (e: MouseEvent) =>
            ((e.currentTarget as HTMLElement).style.border = '3px solid var(--q-positive)')
        "
        @mouseleave="
          (e: MouseEvent) =>
            ((e.currentTarget as HTMLElement).style.border = '1px solid var(--q-positive)')
        "
      >
        <!-- Ícono fijo a la izquierda -->
        <Icon
          icon="mdi:file-document-multiple-outline"
          style="
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 10px;
            padding: 6px;
            font-size: 40px;
            color: var(--q-positive);
            background-color: rgba(33, 186, 69, 0.1); /* Quasar positive con 10% opacidad */
          "
        />

        <!-- Texto centrado -->
        <span style="margin-left: 28px; width: 100%; text-align: center">
          {{ data.label }}
        </span>
      </q-card>
    </template>

    <!-- nodo-branch -->
    <template #node-branch="{ data }">
      <q-card
        class="text-black"
        style="
          min-width: 300px;
          min-height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--q-warning);
          transition: border 0.2s ease-in-out;
          position: relative;
          padding: 0 12px;
        "
        @mouseover="handleBranchHoverIn"
        @mouseleave="handleBranchHoverOut"
      >
        <Icon
          icon="mdi:source-branch"
          style="
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            border-radius: 8px;
            padding: 6px;
            font-size: 40px;
            color: var(--q-warning);
            background-color: rgba(255, 193, 7, 0.15);
          "
        />

        <span style="margin-left: 28px; width: 100%; text-align: center">
          {{ data.label }}
        </span>
      </q-card>
    </template>

    <!-- nodo-branch -->
    <template #node-branchWithoutIcon="{ data }">
      <q-card
        class="text-black"
        style="
          min-width: 300px;
          min-height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--q-warning);
          transition: border 0.2s ease-in-out;
          position: relative;
          padding: 0 12px;
        "
        @mouseover="handleBranchHoverIn"
        @mouseleave="handleBranchHoverOut"
      >
        <span style="margin-left: 28px; width: 100%; text-align: center">
          {{ data.label }}
        </span>
      </q-card>
    </template>

    <!-- nodo-fin -->
    <template #node-fin="{ data }">
      <q-card
        class="bg-grey-6 text-white text-center content-center"
        style="min-width: 60px; border-radius: 10px; min-height: 40px"
      >
        {{ data.label }}
      </q-card>
    </template>

    <MiniMap position="bottom-right" />

    <Controls position="top-left">
      <ControlButton title="Randomize" @click="updatePos">🎲</ControlButton>
    </Controls>
  </VueFlow>

  <NodeEditDrawer
    v-model="drawerOpen"
    :node="selectedNode"
    :children="selectedBranchChildren"
    @save="onSaveNodeLabel"
  />

  <NodeCreationDrawer v-model="creationDrawerOpen" @select="onSelectNodeType" />
</template>
