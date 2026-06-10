<template>
  <Disclosure v-slot="{ open }" :default-open="defaultOpen">
    <DisclosureButton
      class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium focus:outline-none hover:bg-white/5 transition-colors"
    >
      <slot name="button" :open="open" />
      <ChevronDown
        :class="['w-4 h-4 transition-transform flex-shrink-0 ml-2', open ? 'rotate-180' : '']"
        style="color: rgba(168,153,124,0.82);"
      />
    </DisclosureButton>
    <DisclosurePanel class="px-4 pb-4">
      <slot name="panel" />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { ChevronDown } from 'lucide-vue-next';
defineProps<{ defaultOpen?: boolean }>();
</script>
