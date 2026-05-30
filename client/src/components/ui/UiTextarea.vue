<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm" style="color: rgba(255,255,255,0.5);">{{ label }}</label>
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
      style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @focus="($event.target as HTMLTextAreaElement).style.borderColor = '#6366f1'"
      @blur="($event.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.08)'"
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
