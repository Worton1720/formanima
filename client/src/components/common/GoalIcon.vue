<template>
  <component
    :is="lucideIcon"
    v-if="lucideIcon"
    :style="{ color: color || '#e2532b' }"
  />
  <span v-else>{{ icon || '🎯' }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getIcon } from '../../utils/iconMap';

const props = defineProps<{ icon?: string; color?: string }>();

// mdi-* иконки рендерим как lucide-компоненты, иначе показываем эмодзи/текст как есть.
const lucideIcon = computed(() =>
  props.icon && props.icon.startsWith('mdi-') ? getIcon(props.icon) : null,
);
</script>
