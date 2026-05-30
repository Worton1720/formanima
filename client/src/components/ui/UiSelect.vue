<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm" style="color: rgba(255,255,255,0.5);">{{ label }}</label>
    <Listbox :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
      <div class="relative">
        <ListboxButton
          class="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm focus:outline-none"
          style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
        >
          <span>{{ selectedLabel }}</span>
          <ChevronDown class="w-4 h-4" style="color: rgba(255,255,255,0.5);" />
        </ListboxButton>
        <ListboxOptions
          class="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-xl focus:outline-none"
          style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);"
        >
          <ListboxOption
            v-for="opt in options"
            :key="opt.value"
            :value="opt.value"
            v-slot="{ active, selected }"
          >
            <div
              :class="['px-3 py-2 text-sm cursor-pointer', active ? 'bg-white/8' : '']"
              :style="selected ? 'color: #6366f1;' : 'color: rgba(255,255,255,0.87);'"
            >
              {{ opt.label }}
            </div>
          </ListboxOption>
        </ListboxOptions>
      </div>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps<{
  modelValue?: string;
  label?: string;
  options: { value: string; label: string }[];
}>();
defineEmits<{ 'update:modelValue': [v: string] }>();

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label ?? '—',
);
</script>
