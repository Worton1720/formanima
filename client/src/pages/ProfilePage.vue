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

          <!-- Push-уведомления -->
          <div class="border-t mt-4 mb-4" style="border-color: rgba(243,234,214,0.10);" />
          <p class="text-sm font-medium mb-4">Уведомления</p>

          <div v-if="pushSupported" class="flex items-center gap-3 mb-3">
            <Bell class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
            <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Push-уведомления</span>
            <UiSwitch :model-value="pushEnabled" @update:model-value="togglePush" />
          </div>

          <template v-if="pushEnabled && notifPrefs">
            <div class="flex items-center gap-3 mb-3">
              <Clock class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
              <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Напоминание</span>
              <UiSwitch
                :model-value="notifPrefs.reminderEnabled"
                @update:model-value="(v) => savePref({ reminderEnabled: v })"
              />
            </div>
            <div v-if="notifPrefs.reminderEnabled" class="flex items-center gap-3 mb-3 pl-8">
              <span class="text-sm flex-1" style="color: rgba(168,153,124,0.62);">Время (МСК)</span>
              <div class="flex items-center gap-1">
                <select
                  :value="utcToMsk(notifPrefs.reminderTime).split(':')[0]"
                  class="rounded-lg px-2 py-1 text-sm"
                  style="background: #1c160f; border: 1px solid rgba(243,234,214,0.10); color: rgba(243,234,214,0.92);"
                  @change="(e) => savePref({ reminderTime: mskToUtc(`${(e.target as HTMLSelectElement).value}:${utcToMsk(notifPrefs!.reminderTime).split(':')[1]}`) })"
                >
                  <option v-for="h in 24" :key="h - 1" :value="String(h - 1).padStart(2, '0')">
                    {{ String(h - 1).padStart(2, '0') }}
                  </option>
                </select>
                <span style="color: rgba(243,234,214,0.4);">:</span>
                <select
                  :value="utcToMsk(notifPrefs.reminderTime).split(':')[1]"
                  class="rounded-lg px-2 py-1 text-sm"
                  style="background: #1c160f; border: 1px solid rgba(243,234,214,0.10); color: rgba(243,234,214,0.92);"
                  @change="(e) => savePref({ reminderTime: mskToUtc(`${utcToMsk(notifPrefs!.reminderTime).split(':')[0]}:${(e.target as HTMLSelectElement).value}`) })"
                >
                  <option v-for="m in ['00','05','10','15','20','25','30','35','40','45','50','55']" :key="m" :value="m">
                    {{ m }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-3 mb-3">
              <Trophy class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
              <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Достижения</span>
              <UiSwitch
                :model-value="notifPrefs.achievementEnabled"
                @update:model-value="(v) => savePref({ achievementEnabled: v })"
              />
            </div>
            <div class="flex items-center gap-3 mb-3">
              <Flame class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
              <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Серия под угрозой</span>
              <UiSwitch
                :model-value="notifPrefs.streakEnabled"
                @update:model-value="(v) => savePref({ streakEnabled: v })"
              />
            </div>
            <div class="flex items-center gap-3">
              <Zap class="w-5 h-5 flex-shrink-0" style="color: rgba(168,153,124,0.62);" />
              <span class="text-sm flex-1" style="color: rgba(168,153,124,0.95);">Повышение уровня</span>
              <UiSwitch
                :model-value="notifPrefs.levelUpEnabled"
                @update:model-value="(v) => savePref({ levelUpEnabled: v })"
              />
            </div>
          </template>

          <p v-if="!pushSupported" class="text-xs mt-2" style="color: rgba(168,153,124,0.5);">
            Браузер не поддерживает уведомления
          </p>
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

      <div v-if="auth.userRole === 'admin'" class="border-t px-6 py-3" style="border-color: rgba(243,234,214,0.10);">
        <router-link
          to="/admin"
          class="flex items-center gap-3 py-2"
          style="color: rgba(168,153,124,0.95);"
        >
          <ShieldCheck class="w-5 h-5 flex-shrink-0" style="color: #e2532b;" />
          <span class="text-sm flex-1">Админ-панель</span>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Mail, Calendar, LogOut, Pencil, Languages, Trophy, ChevronRight, ShieldCheck, Bell, Clock, Flame, Zap } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store';
import { useNotify } from '../composables/useNotify';
import { usePushNotifications } from '../composables/usePushNotifications';
import { useNotificationsStore } from '../stores/notifications.store';
import { authApi } from '../api/auth.api';
import { UiButton, UiInput, UiSpinner, UiSwitch } from '../components/ui';
import GamificationHero from '../components/gamification/GamificationHero.vue';
import type { User as UserType } from '../types';
import type { PushPreferences } from '../api/notifications.api';

const auth = useAuthStore();
const router = useRouter();
const { notify } = useNotify();
const push = usePushNotifications();
const notifStore = useNotificationsStore();

const profile = ref<UserType | null>(null);
const loading = ref(true);
const saving = ref(false);
const editMode = ref(false);
const nameInput = ref('');
const language = ref<'ru' | 'en'>(
  (localStorage.getItem('language') as 'ru' | 'en') ?? 'ru',
);

const pushSupported = push.isSupported;
const pushEnabled = ref(push.isSubscribed.value);
const notifPrefs = computed(() => notifStore.preferences);

onMounted(async () => {
  try {
    profile.value = await authApi.getMe();
  } catch {
    notify('Не удалось загрузить профиль');
  } finally {
    loading.value = false;
  }

  if (!push.isSupported.value) return;

  await push.checkSubscription();
  if (push.isSubscribed.value) {
    pushEnabled.value = true;
    await notifStore.fetchPreferences();
  } else {
    pushEnabled.value = true;
    const ok = await push.subscribe();
    pushEnabled.value = ok;
    if (ok) await notifStore.fetchPreferences();
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

function utcToMsk(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String((h + 3) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function mskToUtc(time: string): string {
  const [h, m] = time.split(':').map(Number);
  return `${String((h - 3 + 24) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function setLanguage(lang: 'ru' | 'en') {
  language.value = lang;
  localStorage.setItem('language', lang);
}

async function togglePush(enabled: boolean) {
  pushEnabled.value = enabled;
  if (enabled) {
    const ok = await push.subscribe();
    pushEnabled.value = ok;
    if (ok) {
      await notifStore.fetchPreferences();
      notify('Уведомления включены', 'success');
    } else {
      notify('Не удалось получить разрешение на уведомления');
    }
  } else {
    await push.unsubscribe();
    notifStore.preferences = null;
    notify('Уведомления отключены', 'info');
  }
}

async function savePref(dto: Partial<PushPreferences>) {
  try {
    await notifStore.updatePreferences(dto);
  } catch {
    notify('Не удалось сохранить настройки');
  }
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
