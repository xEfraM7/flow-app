<template>
  <q-drawer v-model="isOpen" side="right" bordered :width="500">
    <div class="q-pa-lg">
      <!-- 🧠 Título con ícono -->
      <div class="row items-center q-mb-lg">
        <Icon
          :icon="isBranchNode ? 'ion:git-network' : 'mdi:file-document-multiple-outline'"
          style="font-size: 40px; border-radius: 10px; padding: 6px; margin-right: 12px"
          v-if="isBranchNode"
        />
        <Icon
          v-else
          icon="mdi:file-document-multiple-outline"
          style="font-size: 40px; border-radius: 10px; padding: 6px; margin-right: 12px"
        />
        <div>
          <p class="text-h6 q-mb-none">{{ isBranchNode ? 'Brunch' : 'Simple' }}</p>
        </div>
      </div>

      <!-- Nodo Simple -->
      <q-input
        v-if="!isBranchNode"
        outlined
        dense
        v-model="label"
        label="Nombre del paso"
        class="rounded-input q-mb-md"
        input-class="text-black"
      />

      <!-- Nodo Branch -->
      <div v-if="isBranchNode">
        <q-input dense outlined v-model="label" label="Nombre del paso" class="q-mb-md" />
        <q-input dense outlined v-model="branchChild1Label" label="Condición 1" class="q-mb-md" />
        <q-input dense outlined v-model="branchChild2Label" label="Condición 2" class="q-mb-md" />
      </div>

      <div class="row justify-end q-gutter-sm q-mt-md">
        <!-- Botón Eliminar (rojo, texto) -->
        <q-btn flat label="Eliminar" color="negative" @click="$emit('remove', node!.id)" />

        <!-- Botón Cancelar (plano, sin color) -->
        <q-btn flat label="Cancelar" @click="$emit('update:modelValue', false)" />

        <!-- Botón Guardar (fondo oscuro, texto blanco) -->
        <q-btn unelevated color="dark" text-color="white" label="Confirmar" @click="save" />
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { watch, ref, computed } from 'vue';
import type { Node } from '@vue-flow/core';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  modelValue: boolean;
  node: Node | null;
  children?: Node[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e: 'save', payload: any): void;
  (e: 'remove', id: string): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const label = ref('');
const branchChild1Label = ref('');
const branchChild2Label = ref('');
const isBranchNode = ref(false);

watch(
  () => props.node,
  (newNode) => {
    if (!newNode) return;

    isBranchNode.value = newNode.type === 'branch';

    // Deja todo en blanco
    label.value = '';
    branchChild1Label.value = '';
    branchChild2Label.value = '';
  },
  { immediate: true },
);

function save() {
  if (!props.node) return;

  const type = props.node.type;

  if (type === 'branch') {
    emit('save', {
      type: 'branch',
      id: props.node.id,
      mainLabel: label.value,
      childIds: [props.children?.[0]?.id, props.children?.[1]?.id],
      childLabels: [branchChild1Label.value, branchChild2Label.value],
    });
  } else if (type === 'simple') {
    emit('save', {
      type: 'simple',
      id: props.node.id,
      label: label.value,
    });
  }

  isOpen.value = false;
}
</script>
