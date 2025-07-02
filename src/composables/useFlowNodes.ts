// src/composables/useFlowNodes.ts
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

import {
  createInicioNode,
  createFinNode,
  createAddNode,
  createDefaultNode,
  createBranchNode,
  createBranchChildrenNode,
} from 'src/service/nodeFactory';

const spacing = 100;

const initialNodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const createdNodes = ref<Node[]>([]);

// 🔧 Función para evitar duplicados
function addEdgeIfNotExists(sourceId: string, targetId: string) {
  const edgeId = `e-${sourceId}->${targetId}`;
  const exists = edges.value.some(
    (e) => e.id === edgeId || (e.source === targetId && e.target === sourceId), // Evita bidireccionales cruzadas
  );

  if (!exists) {
    edges.value.push({
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    });
  }
}

function initInitialNodes() {
  initialNodes.value = [
    createInicioNode(), // id: 1
    createAddNode('add-node', 400), // id: add-node
    createFinNode('2', 500), // id: 2
  ];

  edges.value = [
    {
      id: 'e-1->add-node',
      source: '1',
      target: 'add-node',
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: 'e-add-node->2',
      source: 'add-node',
      target: '2',
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
  ];
}

function addDefaultNode(clickedIndex: number): Node[] {
  const clickedNode = initialNodes.value[clickedIndex];
  if (!clickedNode) return initialNodes.value;

  const currentY = clickedNode.position.y;
  const id = `n-${Date.now()}`;
  const addId = `add-${Date.now() + 1}`;

  const newNode = createDefaultNode(id, 'Nombre de paso simple', currentY + spacing);
  const newAdd = createAddNode(addId, currentY + spacing * 2);

  createdNodes.value.push(newNode);

  initialNodes.value.splice(clickedIndex + 1, 0, newNode, newAdd);

  for (let i = clickedIndex + 3; i < initialNodes.value.length; i++) {
    initialNodes.value[i]!.position.y += spacing * 2;
  }

  // 👇 Solo agregamos edges necesarios
  addEdgeIfNotExists(clickedNode.id, newNode.id);
  addEdgeIfNotExists(newNode.id, newAdd.id);

  return initialNodes.value;
}

function addBranchNode(clickedIndex: number): Node[] {
  const clickedNode = initialNodes.value[clickedIndex];
  if (!clickedNode) return initialNodes.value;

  const currentY = clickedNode.position.y;

  // Elimina nodo fin si existe
  const finIndex = initialNodes.value.findIndex((n) => n.type === 'fin');
  if (finIndex !== -1) {
    initialNodes.value.splice(finIndex, 1);
  }

  const uid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const id1 = `n-${uid()}`;
  const id2 = `n-${uid()}`;
  const id3 = `n-${uid()}`;
  const add1 = `add-${uid()}`;
  const add2 = `add-${uid()}`;
  const fin1 = `fin-${uid()}`;
  const fin2 = `fin-${uid()}`;

  const node1 = createBranchNode(id1, 'Nombre de paso brunch', -115, currentY + spacing);
  const node2 = createBranchChildrenNode(id2, 'Nombre de brunch 1', -300, currentY + spacing * 3);
  const node3 = createBranchChildrenNode(id3, 'Nombre de brunch 2', 100, currentY + spacing * 3);
  const addNode1 = createAddNode(add1, currentY + spacing * 4);
  addNode1.position.x = node2.position.x + 130;

  const addNode2 = createAddNode(add2, currentY + spacing * 4);
  addNode2.position.x = node3.position.x + 130;

  const finNode1 = createFinNode(fin1, currentY + spacing * 5);
  finNode1.position.x = addNode1.position.x - 10;

  const finNode2 = createFinNode(fin2, currentY + spacing * 5);
  finNode2.position.x = addNode2.position.x - 10;

  initialNodes.value.splice(
    clickedIndex + 1,
    0,
    node1,
    node2,
    node3,
    addNode1,
    addNode2,
    finNode1,
    finNode2,
  );

  // ✅ Conexiones explícitas, sin rebuildEdges
  addEdgeIfNotExists(clickedNode.id, node1.id);
  addEdgeIfNotExists(node1.id, node2.id);
  addEdgeIfNotExists(node1.id, node3.id);
  addEdgeIfNotExists(node2.id, addNode1.id);
  addEdgeIfNotExists(node3.id, addNode2.id);
  addEdgeIfNotExists(addNode1.id, finNode1.id);
  addEdgeIfNotExists(addNode2.id, finNode2.id);

  return initialNodes.value;
}

function getConnectedNodes(nodeId: string): Node[] {
  const connectedIds = new Set<string>();

  edges.value.forEach((edge) => {
    if (edge.source === nodeId) connectedIds.add(edge.target);
    if (edge.target === nodeId) connectedIds.add(edge.source);
  });

  return initialNodes.value.filter((node) => connectedIds.has(node.id));
}

function reorderNodePositions() {
  let y = 300; // Y inicial
  const spacing = 100;

  const ordered = initialNodes.value.slice().sort((a, b) => a.position.y - b.position.y); // Ordenamos por Y

  for (const node of ordered) {
    node.position.y = y;
    y += spacing;
  }
}
function appendFinIfMissing() {
  const hasFin = initialNodes.value.some((n) => n.type === 'fin');
  if (hasFin) return;

  const maxY = Math.max(...initialNodes.value.map((n) => n.position.y));
  const newFinId = `fin-${Date.now()}`;
  const newFin = createFinNode(newFinId, maxY + 100);

  initialNodes.value.push(newFin);

  // Conectar al último "add" que no tenga edge hacia un fin
  const addCandidates = initialNodes.value.filter((n) => n.type === 'add').reverse(); // revisar de abajo hacia arriba

  const targetAdd = addCandidates.find(
    (n) =>
      !edges.value.some(
        (e) =>
          e.source === n.id &&
          initialNodes.value.find((node) => node.id === e.target && node.type === 'fin'),
      ),
  );

  if (targetAdd) {
    edges.value.push({
      id: `e-${targetAdd.id}->${newFin.id}`,
      source: targetAdd.id,
      target: newFin.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    });
  }
}

function removeNodeById(id: string) {
  const node = initialNodes.value.find((n) => n.id === id);
  if (!node) return;

  if (node.type === 'simple') {
    const index = initialNodes.value.findIndex((n) => n.id === id);
    const nextNode = initialNodes.value[index + 1];

    // Si el nodo siguiente es "add", lo eliminamos también
    const idsToRemove = [id];
    if (nextNode?.type === 'add') {
      idsToRemove.push(nextNode.id);
    }

    initialNodes.value = initialNodes.value.filter((n) => !idsToRemove.includes(n.id));
    edges.value = edges.value.filter(
      (e) => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target),
    );
  }

  if (node.type === 'branch') {
    const branchIndex = initialNodes.value.findIndex((n) => n.id === id);
    const children = initialNodes.value.slice(branchIndex + 1, branchIndex + 7);
    const idsToRemove = [node.id, ...children.map((n) => n.id)];

    initialNodes.value = initialNodes.value.filter((n) => !idsToRemove.includes(n.id));
    edges.value = edges.value.filter(
      (e) => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target),
    );
  }

  reorderNodePositions(); // 🧠 Reorganiza visual
  appendFinIfMissing(); // 🧩 Añade uno nuevo si ya no queda ninguno
}

export function useFlowNodes() {
  return {
    initialNodes,
    edges,
    createdNodes,
    initInitialNodes,
    addDefaultNode,
    addBranchNode,
    getConnectedNodes,
    removeNodeById,
  };
}
