<template>
  <div
    :class="[
      'rounded-2xl',
      variantClasses[variant ?? 'elevated'],
      $attrs.class,
    ]"
    :style="(color && variant === 'tonal') ? `background-color: ${color}18;` : undefined"
    v-bind="{ ...$attrs, class: undefined, style: undefined }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{
  variant?: 'elevated' | 'tonal' | 'outlined';
  color?: string;
}>();

const variantClasses: Record<string, string> = {
  elevated: 'forge-card',
  tonal: 'bg-surface-variant border border-border',
  outlined: 'bg-surface border border-border',
};
</script>
