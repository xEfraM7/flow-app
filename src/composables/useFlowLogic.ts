import { ref, computed } from 'vue';
import type { Node } from '@vue-flow/core';
import { useFlowNodes } from './useFlowNodes';

const {
  initialNodes,
  addDefaultNode,
  initInitialNodes,
  edges,
  addBranchNode,
  getConnectedNodes,
  removeNodeById,
} = useFlowNodes();

export const creationDrawerOpen = ref(false);
export const clickedAddNodeId = ref<string | null>(null);
export const drawerOpen = ref(false);
export const selectedNode = ref<Node | null>(null);
export const selectedBranchChildren = ref<Node[]>([]);
export const gotoSourceId = ref<string | null>(null);
export const gotoModeActive = computed(() => gotoSourceId.value !== null);

export function onNodeClick({ node }: { node: Node }) {
  if (gotoSourceId.value) {
    if (['simple', 'branch'].includes(node.type ?? '')) {
      edges.value.push({
        id: `e-${gotoSourceId.value}->${node.id}`,
        source: gotoSourceId.value,
        target: node.id,
        animated: true,
        markerEnd: 'arrowclosed',
      });

      // 🧼 Reset highlight
      const finNode = initialNodes.value.find((n) => n.id === gotoSourceId.value);
      if (finNode) {
        finNode.data.highlightGoto = false;
        finNode.data.connectedNodeType = node.type;
        finNode.data.connectedNodeLabel = node.data.label;
      }
    }
    gotoSourceId.value = null;
    return;
  }

  if (node.type === 'add') {
    clickedAddNodeId.value = node.id;
    creationDrawerOpen.value = true;
    return;
  }

  const nonEditable = ['inicio', 'fin', 'branchWithoutIcon'];
  if (!node.type || nonEditable.includes(node.type)) return;

  selectedNode.value = node;

  if (node.type === 'branch') {
    const connected = getConnectedNodes(node.id);
    selectedBranchChildren.value = connected.filter((n) => n.type !== 'add' && n.type !== 'fin');
  } else {
    selectedBranchChildren.value = [];
  }

  drawerOpen.value = true;
}

export function onSelectNodeType(type: 'simple' | 'branch' | 'goto') {
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
      clickedAddNodeId.value = null;
      return;
    }

    const edgeToFin = edges.value.find(
      (edge) =>
        edge.source === clickedAddNode.id &&
        initialNodes.value.find((n) => n.id === edge.target && n.type === 'fin'),
    );

    const finNode = edgeToFin ? initialNodes.value.find((n) => n.id === edgeToFin.target) : null;

    if (!finNode) {
      alert('❌ No se encontró un nodo fin conectado al nodo crear');
    } else {
      gotoSourceId.value = finNode.id;

      // ✅ Aplica highlight visual al nodo fin
      finNode.data.highlightGoto = true;
    }
  }

  clickedAddNodeId.value = null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function onSaveNodeLabel(payload: any) {
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

export function onRemoveNode(id: string) {
  removeNodeById(id);
  selectedNode.value = null;
  selectedBranchChildren.value = [];
  drawerOpen.value = false;

  if (
    initialNodes.value.length === 3 &&
    !initialNodes.value.some((n) => ['simple', 'branch', 'goto'].includes(n.type ?? ''))
  ) {
    initInitialNodes();
  }
}

export function updatePos() {
  initialNodes.value = initialNodes.value.map((node) => ({
    ...node,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
  }));
}

export function useFlowLogic() {
  return {
    initialNodes,
    edges,
    drawerOpen,
    selectedNode,
    selectedBranchChildren,
    creationDrawerOpen,
    gotoModeActive,
    initInitialNodes,
  };
}
