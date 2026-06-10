<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : (type ?? 'button')"
    :disabled="to ? undefined : (disabled || loading)"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]',
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
  primary:
    'rounded-lg text-white bg-gradient-to-b from-[#ec6038] to-[#d6451f] ' +
    'shadow-[inset_0_1px_0_rgba(255,225,200,0.35),0_10px_24px_-12px_rgba(226,83,43,0.8)] ' +
    'hover:from-[#f06a40] hover:to-[#e2532b] hover:shadow-[inset_0_1px_0_rgba(255,225,200,0.4),0_14px_30px_-12px_rgba(226,83,43,0.95)]',
  secondary: 'bg-surface-variant hover:bg-surface-raised text-text rounded-lg border border-border',
  ghost: 'hover:bg-gold/10 text-text-muted hover:text-text rounded-lg',
  danger: 'bg-error/12 hover:bg-error/20 text-error rounded-lg border border-error/20',
  tonal: 'bg-gold/12 hover:bg-gold/20 text-gold rounded-lg border border-gold/15',
  outlined: 'border border-border-strong hover:bg-gold/8 text-text rounded-lg',
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
