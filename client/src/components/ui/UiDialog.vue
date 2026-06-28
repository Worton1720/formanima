<template>
  <TransitionRoot :show="modelValue" as="template">
    <Dialog @close="!persistent && $emit('update:modelValue', false)">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 z-40" style="background: rgba(0,0,0,0.6);" />
      </TransitionChild>

      <!-- Panel container -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="ease-out duration-200" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
          leave="ease-in duration-150" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
        >
          <DialogPanel
            :class="['w-full rounded-2xl shadow-2xl max-h-[85dvh] overflow-y-auto overscroll-contain', maxWidthClasses[maxWidth ?? 'md']]"
            style="background: #211a12;"
          >
            <slot />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from '@headlessui/vue';

defineProps<{
  modelValue: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  persistent?: boolean;
}>();
defineEmits<{ 'update:modelValue': [v: boolean] }>();

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};
</script>
