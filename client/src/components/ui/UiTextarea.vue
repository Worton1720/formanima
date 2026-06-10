<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-xs font-medium uppercase tracking-wider" style="color: rgba(168,153,124,0.82);">{{ label }}</label>
    <textarea
      v-bind="$attrs"
      :value="modelValue"
      :rows="rows ?? 3"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="[
        'w-full rounded-xl px-3 py-2 text-sm transition-colors focus:outline-none resize-none',
        error ? 'border-error' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      style="background: #1c160f; border: 1px solid rgba(243,234,214,0.10); color: rgba(243,234,214,0.92);"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @focus="($event.target as HTMLTextAreaElement).style.borderColor = '#e0aa4e'; ($event.target as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(224,170,78,0.14)'"
      @blur="($event.target as HTMLTextAreaElement).style.borderColor = 'rgba(243,234,214,0.10)'; ($event.target as HTMLTextAreaElement).style.boxShadow = 'none'"
    />
    <p v-if="error" class="text-xs text-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
defineProps<{
  modelValue?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
}>();
defineEmits<{ 'update:modelValue': [v: string] }>();
</script>
