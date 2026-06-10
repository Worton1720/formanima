<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium uppercase tracking-wider" style="color: rgba(168,153,124,0.82);">{{ label }}</label>
    <div class="relative">
      <component
        :is="prependIcon"
        v-if="prependIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style="color: rgba(168,153,124,0.82);"
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
        style="background: #1c160f; border: 1px solid rgba(243,234,214,0.10); color: rgba(243,234,214,0.92);"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="($event.target as HTMLInputElement).style.borderColor = '#e0aa4e'; ($event.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(224,170,78,0.14)'"
        @blur="($event.target as HTMLInputElement).style.borderColor = error ? '#d6452b' : 'rgba(243,234,214,0.10)'; ($event.target as HTMLInputElement).style.boxShadow = 'none'"
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
