<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : (type ?? 'button')"
    :disabled="to ? undefined : (disabled || loading)"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      sizeClasses[size ?? 'md'],
      variantClasses[variant ?? 'primary'],
      (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    ]"
  >
    <svg v-if="loading" :class="['spin', spinnerSize[size ?? 'md']]" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </component>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tonal' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
}>();

const variantClasses: Record<string, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white rounded-xl',
  secondary: 'bg-surface-variant hover:bg-surface text-text rounded-xl border border-border',
  ghost: 'hover:bg-white/8 text-text-muted hover:text-text rounded-xl',
  danger: 'bg-error/10 hover:bg-error/20 text-error rounded-xl',
  tonal: 'bg-primary/15 hover:bg-primary/25 text-primary rounded-xl',
  outlined: 'border border-border hover:bg-white/5 text-text rounded-xl',
};
const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
const spinnerSize: Record<string, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};
</script>
