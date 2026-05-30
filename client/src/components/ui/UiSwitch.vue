<template>
  <Switch
    :model-value="modelValue"
    :class="['relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none', modelValue ? 'bg-primary' : 'bg-white/20']"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <span
      :class="['inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', modelValue ? 'translate-x-6' : 'translate-x-1']"
    />
  </Switch>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue';
defineProps<{ modelValue: boolean }>();
defineEmits<{ 'update:modelValue': [v: boolean] }>();
</script>
