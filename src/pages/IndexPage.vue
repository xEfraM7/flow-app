<script setup lang="ts">
// Cores
import { onMounted } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import { Controls, ControlButton } from '@vue-flow/controls';
import { Background } from '@vue-flow/background';

// Drawers
import NodeEditDrawer from 'src/components/drawers/NodeEditDrawer.vue';
import NodeCreationDrawer from 'src/components/drawers/NodeCreationDrawer.vue';

// Nodos
import SimpleNode from 'src/components/nodes/SimpleNode.vue';
import BranchNodeWithoutIcon from 'src/components/nodes/BranchNodeWithoutIcon.vue';
import FinNode from 'src/components/nodes/FinNode.vue';
import AddNode from 'src/components/nodes/AddNode.vue';
import InicioNode from 'src/components/nodes/InicioNode.vue';
import BranchNode from 'src/components/nodes/BranchNode.vue';

// Logica
import {
  useFlowLogic,
  onNodeClick,
  onSelectNodeType,
  onSaveNodeLabel,
  onRemoveNode,
  updatePos,
} from 'src/composables/useFlowLogic';

const {
  initialNodes,
  edges,
  drawerOpen,
  selectedNode,
  selectedBranchChildren,
  creationDrawerOpen,
  gotoModeActive,
  initInitialNodes,
} = useFlowLogic();

onMounted(initInitialNodes);
</script>

<template>
  <VueFlow
    :nodes="initialNodes"
    :edges="edges"
    style="width: 100%; height: 100vh"
    @node-click="onNodeClick"
  >
    <Background variant="dots" :gap="10" :size="1" />

    <template #node-inicio="{ data }">
      <InicioNode :data="data" />
    </template>

    <template #node-add="{ data }">
      <AddNode :data="data" />
    </template>

    <template #node-simple="{ data }">
      <SimpleNode :data="data" :gotoModeActive="gotoModeActive" />
    </template>

    <template #node-branch="{ data }">
      <BranchNode :data="data" :gotoModeActive="gotoModeActive" />
    </template>

    <template #node-branchWithoutIcon="{ data }">
      <BranchNodeWithoutIcon :data="data" />
    </template>

    <template #node-fin="{ data }">
      <FinNode :data="data" />
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
    @remove="onRemoveNode"
  />
  <NodeCreationDrawer v-model="creationDrawerOpen" @select="onSelectNodeType" />
</template>
