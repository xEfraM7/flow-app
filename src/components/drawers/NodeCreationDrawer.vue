<template>
  <div class="container">
    <q-drawer v-model="isOpen" side="right" bordered :width="500">
      <div class="q-pa-lg">
        <p class="text-body2 q-mb-lg">Agregar un paso</p>

        <!-- Paso simple -->
        <p class="text-caption text-positive q-mb-sm">Tipos de pasos simples</p>
        <q-card
          class="my-card q-mb-md"
          flat
          bordered
          style="border: 1px solid rgba(128, 128, 128, 0.4); border-radius: 12px"
        >
          <q-card-section
            clickable
            @click="select('simple')"
            class="cursor-pointer"
            style="position: relative; text-align: center; min-height: 48px"
          >
            <Icon
              icon="mdi:file-document-multiple-outline"
              style="
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                border-radius: 10px;
                padding: 6px;
                font-size: 35px;
                color: var(--q-positive);
                background-color: rgba(33, 186, 69, 0.1);
              "
            />
            <span class="text-body2">Paso simple</span>
          </q-card-section>
        </q-card>

        <!-- Paso branch -->
        <p class="text-caption text-warning q-mb-sm">Tipos de pasos branch</p>
        <q-card
          class="my-card q-mb-md"
          flat
          bordered
          style="border: 1px solid rgba(128, 128, 128, 0.4); border-radius: 12px"
        >
          <q-card-section
            clickable
            @click="select('branch')"
            class="cursor-pointer"
            style="position: relative; text-align: center; min-height: 48px"
          >
            <Icon
              icon="ion:git-network"
              style="
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%) rotate(180deg);
                border-radius: 8px;
                padding: 6px;
                font-size: 35px;
                color: var(--q-warning);
                background-color: rgba(255, 193, 7, 0.15);
                border: 1px solid var(--q-warning);
              "
            />
            <span class="text-body2">Paso branch</span>
          </q-card-section>
        </q-card>

        <!-- Paso ir a (solo si permitido) -->
        <template v-if="canUseGoto">
          <p class="text-caption text-brown q-mb-sm">Otros tipos de pasos</p>
          <q-card
            class="my-card q-mb-md"
            flat
            bordered
            style="border: 1px solid rgba(128, 128, 128, 0.4); border-radius: 12px"
          >
            <q-card-section
              clickable
              @click="select('goto')"
              class="cursor-pointer"
              style="position: relative; text-align: center; min-height: 48px"
            >
              <Icon
                icon="ion:git-merge"
                style="
                  position: absolute;
                  left: 12px;
                  top: 50%;
                  transform: translateY(-50%);
                  border-radius: 10px;
                  padding: 6px;
                  font-size: 28px;
                  color: #795548;
                  background-color: rgba(121, 85, 72, 0.1);
                "
              />
              <span class="text-body2">Paso ir a</span>
            </q-card-section>
          </q-card>
        </template>
      </div>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { useFlowNodes } from 'src/composables/useFlowNodes';

const { initialNodes } = useFlowNodes();

const canUseGoto = computed(() => {
  const hasBranch = initialNodes.value.some((n) => n.type === 'branch');
  const hasSimple = initialNodes.value.some((n) => n.type === 'simple');
  return hasBranch && hasSimple;
});

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'select', type: 'simple' | 'branch' | 'goto'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function select(type: 'simple' | 'branch' | 'goto') {
  emit('select', type);
  isOpen.value = false;
}
</script>

<style scoped>
.container {
  flex: 1;
  margin: 20px;
}
</style>
