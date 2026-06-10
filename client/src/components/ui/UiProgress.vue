<template>
  <div :class="['rounded-full overflow-hidden', heightClass[height ?? 'md']]" style="background: rgba(243,234,214,0.10);">
    <div
      v-if="!indeterminate"
      :style="{
        width: `${Math.min(100, Math.max(0, modelValue ?? 0))}%`,
        backgroundColor: color ?? '#e2532b',
        height: '100%',
        borderRadius: '9999px',
        transition: 'width 0.3s ease',
      }"
    />
    <div
      v-else
      :style="{ backgroundColor: color ?? '#e2532b', width: '33%', height: '100%', borderRadius: '9999px' }"
      class="animate-pulse"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: number;
  color?: string;
  height?: 'xs' | 'sm' | 'md';
  indeterminate?: boolean;
}>();

const heightClass: Record<string, string> = {
  xs: 'h-0.5',
  sm: 'h-1',
  md: 'h-2',
};
</script>
