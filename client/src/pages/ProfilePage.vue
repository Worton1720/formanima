<template>
  <v-container>
    <h1 class="text-h5 mb-6">Профиль</h1>

    <v-card rounded="xl" max-width="500">
      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-text-field
          v-if="!editMode"
          :model-value="profile?.name ?? auth.userName ?? '—'"
          label="Имя"
          readonly
          prepend-inner-icon="mdi-account"
          class="mb-2"
        />
        <v-text-field
          v-else
          v-model="nameInput"
          label="Имя"
          prepend-inner-icon="mdi-account"
          class="mb-2"
          autofocus
          :rules="[(v: string) => v.length >= 2 || 'Минимум 2 символа']"
        />

        <v-text-field
          :model-value="profile?.email ?? auth.userEmail ?? '—'"
          label="Email"
          readonly
          prepend-inner-icon="mdi-email"
          class="mb-2"
        />

        <v-text-field
          v-if="profile?.createdAt"
          :model-value="formatDate(profile.createdAt)"
          label="Дата регистрации"
          readonly
          prepend-inner-icon="mdi-calendar"
          class="mb-4"
        />

        <v-divider class="mb-4" />
        <div class="text-body-2 font-weight-medium mb-3">Настройки</div>

        <div class="d-flex align-center mb-3">
          <v-icon icon="mdi-theme-light-dark" class="mr-3 text-medium-emphasis" />
          <span class="text-body-2 flex-grow-1">Тема оформления</span>
          <v-switch
            :model-value="isDark"
            @update:model-value="toggleTheme"
            :label="isDark ? 'Тёмная' : 'Светлая'"
            density="compact"
            hide-details
            color="primary"
          />
        </div>

        <div class="d-flex align-center">
          <v-icon icon="mdi-translate" class="mr-3 text-medium-emphasis" />
          <span class="text-body-2 flex-grow-1">Язык интерфейса</span>
          <v-btn-toggle
            v-model="language"
            mandatory
            density="compact"
            variant="outlined"
            @update:model-value="saveLanguage"
          >
            <v-btn value="ru" size="small">RU</v-btn>
            <v-btn value="en" size="small">EN</v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn color="error" variant="text" prepend-icon="mdi-logout" @click="logout">
          Выйти
        </v-btn>
        <v-spacer />
        <template v-if="!editMode">
          <v-btn variant="tonal" prepend-icon="mdi-pencil" @click="startEdit">
            Редактировать
          </v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" @click="cancelEdit">Отмена</v-btn>
          <v-btn color="primary" variant="tonal" :loading="saving" @click="saveProfile">
            Сохранить
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { useAuthStore } from '../stores/auth.store';
import { useNotify } from '../composables/useNotify';
import { authApi } from '../api/auth.api';
import type { User } from '../types';

const auth = useAuthStore();
const router = useRouter();
const { notify } = useNotify();
const theme = useTheme();

const profile = ref<User | null>(null);
const loading = ref(true);
const saving = ref(false);
const editMode = ref(false);
const nameInput = ref('');
const language = ref<'ru' | 'en'>(
  (localStorage.getItem('language') as 'ru' | 'en') ?? 'ru',
);

const isDark = computed(() => theme.global.current.value.dark);

onMounted(async () => {
  try {
    profile.value = await authApi.getMe();
  } catch {
    notify('Не удалось загрузить профиль');
  } finally {
    loading.value = false;
  }
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function startEdit() {
  nameInput.value = profile.value?.name ?? auth.userName ?? '';
  editMode.value = true;
}

function cancelEdit() {
  editMode.value = false;
}

async function saveProfile() {
  if (!nameInput.value || nameInput.value.length < 2) return;
  saving.value = true;
  try {
    const updated = await authApi.updateProfile({ name: nameInput.value });
    profile.value = updated;
    if (auth.userName !== undefined) {
      auth.userName = updated.name;
      localStorage.setItem('userName', updated.name);
    }
    editMode.value = false;
    notify('Профиль обновлён', 'success');
  } catch {
    notify('Не удалось сохранить изменения');
  } finally {
    saving.value = false;
  }
}

function toggleTheme(dark: boolean | null) {
  const newTheme = dark ? 'dark' : 'light';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
}

function saveLanguage(lang: 'ru' | 'en') {
  localStorage.setItem('language', lang);
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
