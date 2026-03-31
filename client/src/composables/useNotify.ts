import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const color = ref<'error' | 'success' | 'info'>('error');

export function useNotify() {
  function notify(text: string, type: 'error' | 'success' | 'info' = 'error') {
    message.value = text;
    color.value = type;
    visible.value = true;
  }

  return { visible, message, color, notify };
}
