import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';

const app = createApp(App).use(createPinia()).use(router).use(vuetify);

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  vuetify.theme.global.name.value = 'light';
}

app.mount('#app');
