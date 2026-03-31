<template>
  <v-app>
    <v-navigation-drawer v-if="auth.isAuthenticated" permanent rail>
      <v-list-item prepend-icon="mdi-fire" title="FORMANIMA" nav />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Дашборд" to="/dashboard" />
        <v-list-item prepend-icon="mdi-format-list-checks" title="Привычки" to="/habits" />
        <v-list-item prepend-icon="mdi-account" title="Профиль" to="/profile" />
        <v-list-item prepend-icon="mdi-trophy" title="Достижения" to="/achievements" value="achievements" />
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <slot />
    </v-main>
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
const auth = useAuthStore();
const notify = useNotify();
</script>
