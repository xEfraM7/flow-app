// src/composables/useFlowNodes.ts
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';

// 🧱 Factory centralizado
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

function rebuildEdges() {
  const newEdges: Edge[] = [];

  for (let i = 0; i < initialNodes.value.length - 1; i++) {
    const source = initialNodes.value[i];
    const target = initialNodes.value[i + 1];

    newEdges.push({
      id: `e-${source!.id}->${target!.id}`,
      source: source!.id,
      target: target!.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    });
  }

  edges.value = newEdges;
}

function initInitialNodes() {
  initialNodes.value = [
    createInicioNode(),
    createAddNode('add-node', 400),
    createFinNode('2', 500),
  ];
  rebuildEdges();
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

  rebuildEdges();
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

  // Generar IDs únicos
  const uid = () => `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const id1 = `n-${uid()}`;
  const id2 = `n-${uid()}`;
  const id3 = `n-${uid()}`;
  const add1 = `add-${uid()}`;
  const add2 = `add-${uid()}`;
  const fin1 = `fin-${uid()}`;
  const fin2 = `fin-${uid()}`;

  // Nodos principales
  const node1 = createBranchNode(id1, 'Nombre de paso brunch', -115, currentY + spacing);
  const node2 = createBranchChildrenNode(id2, 'Nombre de brunch 1', -300, currentY + spacing * 3);
  const node3 = createBranchChildrenNode(id3, 'Nombre de brunch 2', 100, currentY + spacing * 3);
  const addNode1 = createAddNode(add1, currentY + spacing * 4);
  addNode1.position.x = node2.position.x + 130;

  const addNode2 = createAddNode(add2, currentY + spacing * 4);
  addNode2.position.x = node3.position.x + 130;

  // Nodos de fin
  const finNode1 = createFinNode(fin1, currentY + spacing * 5);
  finNode1.position.x = addNode1.position.x - 10;

  const finNode2 = createFinNode(fin2, currentY + spacing * 5);
  finNode2.position.x = addNode2.position.x - 10;

  // Insertar en flujo
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

  // Edges específicos
  edges.value.push(
    {
      id: `e-${clickedNode.id}->${node1.id}`,
      source: clickedNode.id,
      target: node1.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${node1.id}->${node2.id}`,
      source: node1.id,
      target: node2.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${node1.id}->${node3.id}`,
      source: node1.id,
      target: node3.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${node2.id}->${addNode1.id}`,
      source: node2.id,
      target: addNode1.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${node3.id}->${addNode2.id}`,
      source: node3.id,
      target: addNode2.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${addNode1.id}->${finNode1.id}`,
      source: addNode1.id,
      target: finNode1.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
    {
      id: `e-${addNode2.id}->${finNode2.id}`,
      source: addNode2.id,
      target: finNode2.id,
      type: 'smoothstep',
      markerEnd: 'arrowclosed',
    },
  );

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

export function useFlowNodes() {
  return {
    initialNodes,
    edges,
    createdNodes,
    initInitialNodes,
    addDefaultNode,
    addBranchNode,
    getConnectedNodes,
  };
}
