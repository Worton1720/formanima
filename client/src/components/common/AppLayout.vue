<template>
  <v-app>
    <v-navigation-drawer v-if="auth.isAuthenticated" permanent rail>
      <v-list-item prepend-icon="mdi-fire" title="FORMANIMA" nav />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Дашборд" to="/dashboard" />
        <v-list-item prepend-icon="mdi-format-list-checks" title="Привычки" to="/habits" />
        <v-list-item prepend-icon="mdi-account" title="Профиль" to="/profile" />
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth.store';
const auth = useAuthStore();
</script>
