<template>
  <div class="max-w-lg mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)]">
    <h1 class="text-2xl font-bold mb-6">Профиль</h1>

    <GamificationHero />

    <div class="rounded-2xl overflow-hidden" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
      <div class="p-6">
        <div v-if="loading" class="flex justify-center py-4">
          <UiSpinner />
        </div>

        <template v-else>
          <!-- Имя -->
          <div class="mb-4">
            <template v-if="!editMode">
              <UiInput
                :model-value="profile?.name ?? auth.userName ?? '—'"
                label="Имя"
                readonly
                :prepend-icon="User"
              />
            </template>
            <template v-else>
              <UiInput
                v-model="nameInput"
                label="Имя"
                placeholder="Ваше имя"
                :prepend-icon="User"
                :error="nameInput.length > 0 && nameInput.length < 2 ? 'Минимум 2 символа' : ''"
                autofocus
              />
            </template>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <UiInput
              :model-value="profile?.email ?? auth.userEmail ?? '—'"
              label="Email"
              readonly
              :prepend-icon="Mail"
            />
          </div>

          <!-- Дата регистрации -->
          <div v-if="profile?.createdAt" class="mb-6">
            <UiInput
              :model-value="formatDate(profile.createdAt)"
              label="Дата регистрации"
              readonly
              :prepend-icon="Calendar"
            />
          </div>

          <div class="border-t mb-4" style="border-color: rgba(243,234,214,0.10);" />
          <p class="text-sm font-medium mb-4">Настройки</p>

          <!-- Язык -->
          <div class="flex items-center gap-3">
            <Languages class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
            <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Язык интерфейса</span>
            <div class="flex rounded-xl overflow-hidden border" style="border-color: rgba(243,234,214,0.12);">
              <button
                v-for="lang in ['ru', 'en']"
                :key="lang"
                class="px-3 py-1 text-xs transition-colors"
                :style="language === lang
                  ? 'background: #e2532b; color: #fff;'
                  : 'background: transparent; color: rgba(168,153,124,0.82);'"
                @click="setLanguage(lang as 'ru' | 'en')"
              >{{ lang.toUpperCase() }}</button>
            </div>
          </div>
        </template>
      </div>

      <div class="border-t px-6 py-3" style="border-color: rgba(243,234,214,0.10);">
        <router-link
          to="/achievements"
          class="flex items-center gap-3 py-2"
          style="color: rgba(168,153,124,0.95);"
        >
          <Trophy class="w-5 h-5 flex-shrink-0" style="color: #e0aa4e;" />
          <span class="text-sm flex-1">Достижения</span>
          <ChevronRight class="w-4 h-4" style="color: rgba(243,234,214,0.3);" />
        </router-link>
      </div>

      <div class="border-t px-6 py-4 flex items-center gap-2" style="border-color: rgba(243,234,214,0.10);">
        <UiButton variant="ghost" @click="logout">
          <LogOut class="w-4 h-4 mr-1" style="color: #d6452b;" />
          <span style="color: #d6452b;">Выйти</span>
        </UiButton>
        <div class="flex-1" />
        <template v-if="!editMode">
          <UiButton variant="tonal" @click="startEdit">
            <Pencil class="w-4 h-4 mr-1" />Редактировать
          </UiButton>
        </template>
        <template v-else>
          <UiButton variant="ghost" @click="cancelEdit">Отмена</UiButton>
          <UiButton :loading="saving" @click="saveProfile">Сохранить</UiButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Mail, Calendar, LogOut, Pencil, Languages, Trophy, ChevronRight } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store';
import { useNotify } from '../composables/useNotify';
import { authApi } from '../api/auth.api';
import { UiButton, UiInput, UiSpinner } from '../components/ui';
import GamificationHero from '../components/gamification/GamificationHero.vue';
import type { User as UserType } from '../types';

const auth = useAuthStore();
const router = useRouter();
const { notify } = useNotify();

const profile = ref<UserType | null>(null);
const loading = ref(true);
const saving = ref(false);
const editMode = ref(false);
const nameInput = ref('');
const language = ref<'ru' | 'en'>(
  (localStorage.getItem('language') as 'ru' | 'en') ?? 'ru',
);

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

function setLanguage(lang: 'ru' | 'en') {
  language.value = lang;
  localStorage.setItem('language', lang);
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
