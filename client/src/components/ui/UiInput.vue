<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm" style="color: rgba(255,255,255,0.5);">{{ label }}</label>
    <div class="relative">
      <component
        :is="prependIcon"
        v-if="prependIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style="color: rgba(255,255,255,0.5);"
      />
      <input
        v-bind="$attrs"
        :value="modelValue"
        :type="type ?? 'text'"
        :disabled="disabled"
        :readonly="readonly"
        :placeholder="placeholder"
        :class="[
          'w-full rounded-xl px-3 py-2 text-sm transition-colors focus:outline-none',
          error ? 'border-error' : 'border-border',
          prependIcon ? 'pl-9' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        ]"
        style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="($event.target as HTMLInputElement).style.borderColor = '#6366f1'"
        @blur="($event.target as HTMLInputElement).style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.08)'"
      />
    </div>
    <p v-if="error" class="text-xs text-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
defineOptions({ inheritAttrs: false });
defineProps<{
  modelValue?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  prependIcon?: Component;
}>();
defineEmits<{ 'update:modelValue': [v: string] }>();
</script>
