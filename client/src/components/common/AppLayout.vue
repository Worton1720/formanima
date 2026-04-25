<template>
  <v-app>
    <!-- Top Bar -->
    <v-app-bar v-if="auth.isAuthenticated" elevation="0" border="b">
      <v-app-bar-title>
        <router-link to="/dashboard" class="text-decoration-none text-primary font-weight-bold">
          FORMANIMA
        </router-link>
      </v-app-bar-title>

      <!-- Desktop nav links -->
      <template v-if="display.mdAndUp.value">
        <v-btn variant="text" to="/dashboard" :active="route.path === '/dashboard'">Дашборд</v-btn>
        <v-btn variant="text" to="/habits" :active="route.path.startsWith('/habits')">Привычки</v-btn>
        <v-btn variant="text" to="/analytics" :active="route.path === '/analytics'">Аналитика</v-btn>
        <v-btn variant="text" to="/achievements" :active="route.path === '/achievements'">Достижения</v-btn>
        <v-btn
          v-if="auth.userRole === 'admin'"
          variant="text"
          to="/admin"
          :active="route.path === '/admin'"
        >Админ</v-btn>
      </template>

      <v-spacer />
      <v-btn icon="mdi-account" variant="text" to="/profile" />
      <v-btn v-if="display.smAndDown.value" icon="mdi-logout" variant="text" @click="logout" />
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>

    <!-- Mobile Bottom Nav -->
    <v-bottom-navigation
      v-if="auth.isAuthenticated && display.smAndDown.value"
      grow
      elevation="8"
    >
      <v-btn to="/dashboard" value="dashboard">
        <v-icon>mdi-view-dashboard</v-icon>
        <span>Дашборд</span>
      </v-btn>
      <v-btn to="/habits" value="habits">
        <v-icon>mdi-format-list-checks</v-icon>
        <span>Привычки</span>
      </v-btn>
      <v-btn to="/analytics" value="analytics">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Аналитика</span>
      </v-btn>
      <v-btn to="/achievements" value="achievements">
        <v-icon>mdi-trophy</v-icon>
        <span>Достижения</span>
      </v-btn>
      <v-btn to="/profile" value="profile">
        <v-icon>mdi-account</v-icon>
        <span>Профиль</span>
      </v-btn>
    </v-bottom-navigation>

    <v-snackbar v-model="notify.visible.value" :color="notify.color.value" timeout="4000" location="bottom right">
      {{ notify.message.value }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="notify.visible.value = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth.store';
import { useNotify } from '../../composables/useNotify';
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';

const auth = useAuthStore();
const notify = useNotify();
const display = useDisplay();
const route = useRoute();
const router = useRouter();

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
