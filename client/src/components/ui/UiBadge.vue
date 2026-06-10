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
  default: 'bg-gold/10 text-text-muted border border-border',
  primary: 'bg-primary/15 text-primary border border-primary/20',
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  error: 'bg-error/15 text-error border border-error/20',
  orange: 'bg-orange/15 text-orange border border-orange/20',
};
</script>
