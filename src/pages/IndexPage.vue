<script setup lang="ts">
import { ref } from 'vue';
import { VueFlow } from '@vue-flow/core';
import type { Node, Edge } from '@vue-flow/core';
import { QDrawer, QList, QItem, QInput, QBtn, QToolbar, QToolbarTitle } from 'quasar';
import { Background } from '@vue-flow/background';

const baseX = 50;
const spacing = 80;

const initialNodes = ref<Node[]>([
  { id: '1', type: 'inicio', position: { x: baseX, y: 50 }, data: { label: 'Inicio' } },
  { id: 'add-node', type: 'add', position: { x: baseX, y: 130 }, data: { label: '+' } },
  { id: '2', type: 'fin', position: { x: baseX, y: 210 }, data: { label: 'Fin' } },
]);

const edges = ref<Edge[]>([
  { id: 'e1-add', source: '1', target: 'add-node', markerEnd: 'arrowclosed' },
  { id: 'eadd-2', source: 'add-node', target: '2', markerEnd: 'arrowclosed' },
]);

const drawerOpen = ref(false); // Drawer para editar nodo
const creationDrawerOpen = ref(false); // Drawer para crear nodo
const selectedNode = ref<Node | null>(null);
const createdNodes = ref<Node[]>([]);
const editingLabel = ref('');

// 👉 Editar nodo visible solo si es "default"
function onNodeClick({ node }: { node: Node }) {
  if (node.type === 'default') {
    selectedNode.value = node;
    editingLabel.value = node.data.label || '';
    drawerOpen.value = true;
  } else if (node.type === 'add') {
    selectedNode.value = node;
    creationDrawerOpen.value = true;
  }
}

function rebuildEdges() {
  edges.value = [];

  for (let i = 0; i < initialNodes.value.length - 1; i++) {
    const fromNode = initialNodes.value[i];
    const toNode = initialNodes.value[i + 1];

    if (fromNode && toNode) {
      edges.value.push({
        id: `e${fromNode.id}-${toNode.id}`,
        source: fromNode.id,
        target: toNode.id,
        markerEnd: 'arrowclosed',
      });
    }
  }
}

function onAddNode(clickedAddNodeId: string) {
  const clickedIndex = initialNodes.value.findIndex((n) => n.id === clickedAddNodeId);
  const clickedNode = initialNodes.value[clickedIndex];
  if (!clickedNode || clickedNode.type !== 'add') return;

  const currentY = clickedNode.position?.y ?? 0;
  const newNodeId = `n-${Date.now()}`;
  const newAddId = `add-${Date.now() + 1}`;

  const newNode: Node = {
    id: newNodeId,
    type: 'default',
    position: { x: baseX, y: currentY + spacing },
    data: { label: `Nodo ${createdNodes.value.length + 1}` },
  };

  const newAddNode: Node = {
    id: newAddId,
    type: 'add',
    position: { x: baseX, y: currentY + spacing * 2 },
    data: { label: '+' },
  };

  createdNodes.value.push(newNode);

  initialNodes.value.splice(clickedIndex + 1, 0, newNode, newAddNode);

  // Mover nodos siguientes
  for (let i = clickedIndex + 3; i < initialNodes.value.length; i++) {
    const node = initialNodes.value[i];
    if (node?.position) {
      node.position.y += spacing * 2;
    }
  }

  rebuildEdges();
}

function removeNode(id: string) {
  initialNodes.value = initialNodes.value.filter((n) => n.id !== id);
  edges.value = edges.value.filter((e) => e.source !== id && e.target !== id);
  createdNodes.value = createdNodes.value.filter((n) => n.id !== id);
  rebuildEdges();
  drawerOpen.value = false;
}

function saveNodeLabel() {
  if (selectedNode.value) {
    selectedNode.value.data.label = editingLabel.value;
    drawerOpen.value = false;
  }
}
</script>

<template>
  <q-layout view="hHh Lpr lFf">
    <!-- Drawer de edición -->
    <q-drawer v-model="drawerOpen" side="right" bordered>
      <q-toolbar class="bg-grey-2 text-black">
        <q-toolbar-title>✏️ Editar Nodo</q-toolbar-title>
      </q-toolbar>

      <q-list v-if="selectedNode">
        <q-item>
          <q-input filled v-model="editingLabel" label="Título del nodo" />
        </q-item>
        <q-item>
          <q-btn color="primary" label="Guardar" @click="saveNodeLabel" />
        </q-item>
        <q-item>
          <q-btn color="negative" label="Eliminar" @click="removeNode(selectedNode.id)" />
        </q-item>
        <q-item>
          <q-btn flat label="Cancelar" @click="drawerOpen = false" />
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Drawer de creación -->
    <q-drawer v-model="creationDrawerOpen" side="right" bordered>
      <q-toolbar class="bg-grey-2 text-black">
        <q-toolbar-title> Agregar un Paso</q-toolbar-title>
      </q-toolbar>

      <q-list>
        <q-item>
          <q-btn
            color="primary"
            label="Paso simple"
            @click="
              () => {
                onAddNode(selectedNode?.id || '');
                creationDrawerOpen = false;
              }
            "
          />
        </q-item>
        <q-item>
          <q-btn
            color="secondary"
            label="Paso branch (2 caminos)"
            @click="
              () => {
                /* lógica futura */
              }
            "
          />
        </q-item>
        <q-item>
          <q-btn
            color="accent"
            label="Otro tipo de paso"
            @click="
              () => {
                /* lógica futura */
              }
            "
          />
        </q-item>
        <q-item>
          <q-btn flat label="Cancelar" @click="creationDrawerOpen = false" />
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <VueFlow
        :nodes="initialNodes"
        :edges="edges"
        style="width: 100%; height: 100vh"
        @node-click="onNodeClick"
      >
        <Background variant="dots" :gap="20" pattern-color="#ccc" />

        <template #node-inicio="{ data }">
          <div
            class="q-pa-sm text-white text-center bg-green-6"
            style="border-radius: 8px; width: 80px"
          >
            {{ data.label }}
          </div>
        </template>

        <template #node-fin="{ data }">
          <div
            class="q-pa-sm text-white text-center bg-grey-6"
            style="border-radius: 8px; width: 60px; font-weight: 400"
          >
            {{ data.label }}
          </div>
        </template>

        <template #node-add="{ data }">
          <div
            class="bg-grey-7 text-white flex flex-center"
            style="width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer"
          >
            {{ data.label }}
          </div>
        </template>
      </VueFlow>
    </q-page-container>
  </q-layout>
</template>
