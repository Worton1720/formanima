<template>
  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', colorClasses[color ?? 'default']]">
    <component :is="prependIcon" v-if="prependIcon" class="w-3 h-3" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
defineProps<{
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'orange';
  prependIcon?: Component;
}>();

const colorClasses: Record<string, string> = {
  default: 'bg-white/10 text-white/60',
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-error/15 text-error',
  orange: 'bg-orange/15 text-orange',
};
</script>
