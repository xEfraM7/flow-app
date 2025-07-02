// src/factories/nodeFactory.ts
import type { Node } from '@vue-flow/core';

const nodeWidth = 150;

function getCenteredX(): number {
  return window.innerWidth / 2 - nodeWidth / 2;
}

export function createInicioNode(): Node {
  return {
    id: '1',
    type: 'inicio',
    position: { x: getCenteredX() + -5, y: 300 },
    data: { label: 'Inicio' },
  };
}

export function createFinNode(id = 'fin', y = 500): Node {
  return {
    id,
    type: 'fin',
    position: { x: getCenteredX() + 5, y },
    data: { label: 'Fin' },
  };
}

export function createAddNode(id: string, y: number): Node {
  return {
    id,
    type: 'add',
    position: { x: getCenteredX() + 15, y },
    data: { label: '+' },
  };
}

export function createDefaultNode(id: string, label: string, y: number): Node {
  return {
    id,
    type: 'simple',
    position: { x: getCenteredX() - 115, y },
    data: { label },
  };
}

export function createBranchNode(id: string, label: string, xOffset: number, y: number): Node {
  return {
    id,
    type: 'branch',
    position: { x: getCenteredX() + xOffset, y },
    data: { label },
  };
}

export function createBranchChildrenNode(
  id: string,
  label: string,
  xOffset: number,
  y: number,
): Node {
  return {
    id,
    type: 'branchWithoutIcon',
    position: { x: getCenteredX() + xOffset, y },
    data: { label },
  };
}
