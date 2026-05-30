<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Панель администратора</h1>

    <div v-if="loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <template v-else>
      <!-- Stats cards -->
      <div v-if="stats" class="grid grid-cols-2 gap-3 mb-6" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        <div class="rounded-xl p-4 text-center" style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);">
          <p class="text-3xl font-bold" style="color: #6366f1;">{{ stats.totalUsers }}</p>
          <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Пользователей</p>
        </div>
        <div class="rounded-xl p-4 text-center" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);">
          <p class="text-3xl font-bold">{{ stats.totalHabits }}</p>
          <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Привычек</p>
        </div>
        <div class="rounded-xl p-4 text-center" style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);">
          <p class="text-3xl font-bold" style="color: #22c55e;">{{ stats.totalCompletions }}</p>
          <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Выполнений</p>
        </div>
        <div class="rounded-xl p-4 text-center" style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);">
          <p class="text-3xl font-bold" style="color: #3b82f6;">{{ stats.activeToday }}</p>
          <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Активны сегодня</p>
        </div>
      </div>

      <h2 class="text-lg font-semibold mb-3">Пользователи</h2>

      <div v-if="users.length === 0" class="text-center py-12" style="color: rgba(255,255,255,0.3);">
        <p>Нет пользователей</p>
      </div>

      <div v-else class="rounded-2xl overflow-hidden" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
        <table class="w-full text-sm">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
              <th class="px-4 py-3 text-left text-xs font-medium" style="color: rgba(255,255,255,0.4);">Email</th>
              <th class="px-4 py-3 text-left text-xs font-medium" style="color: rgba(255,255,255,0.4);">Имя</th>
              <th class="px-4 py-3 text-left text-xs font-medium" style="color: rgba(255,255,255,0.4);">Роль</th>
              <th class="px-4 py-3 text-center text-xs font-medium" style="color: rgba(255,255,255,0.4);">Привычек</th>
              <th class="px-4 py-3 text-center text-xs font-medium" style="color: rgba(255,255,255,0.4);">Страйков</th>
              <th class="px-4 py-3 text-center text-xs font-medium" style="color: rgba(255,255,255,0.4);">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              style="border-bottom: 1px solid rgba(255,255,255,0.05);"
            >
              <td class="px-4 py-3" style="color: rgba(255,255,255,0.87);">{{ user.email }}</td>
              <td class="px-4 py-3" style="color: rgba(255,255,255,0.7);">{{ user.name }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded-full text-xs"
                  :style="roleChipStyle[user.role] ?? roleChipStyle.user"
                >{{ user.role }}</span>
              </td>
              <td class="px-4 py-3 text-center" style="color: rgba(255,255,255,0.7);">{{ user.habitsCount }}</td>
              <td class="px-4 py-3 text-center" style="color: rgba(255,255,255,0.7);">{{ user.strikesCount }}</td>
              <td class="px-4 py-3 text-center">
                <template v-if="user.role !== 'admin'">
                  <button
                    class="p-1.5 rounded-lg mr-1 transition-colors"
                    :style="user.role === 'blocked'
                      ? 'color: #22c55e; background: rgba(34,197,94,0.1);'
                      : 'color: #f59e0b; background: rgba(245,158,11,0.1);'"
                    :title="user.role === 'blocked' ? 'Разблокировать' : 'Заблокировать'"
                    @click="toggleBlock(user.id)"
                  >
                    <UserCheck v-if="user.role === 'blocked'" class="w-4 h-4" />
                    <UserX v-else class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1.5 rounded-lg transition-colors"
                    style="color: #ef4444; background: rgba(239,68,68,0.1);"
                    title="Удалить"
                    @click="remove(user.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UserCheck, UserX, Trash2 } from 'lucide-vue-next';
import { adminApi } from '../api/admin.api';
import { UiSpinner } from '../components/ui';
import type { AdminUser, AdminStats } from '../types';

const loading = ref(true);
const users = ref<AdminUser[]>([]);
const stats = ref<AdminStats | null>(null);

const roleChipStyle: Record<string, string> = {
  admin: 'background: rgba(99,102,241,0.15); color: #6366f1;',
  blocked: 'background: rgba(239,68,68,0.15); color: #ef4444;',
  user: 'background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);',
};

async function load() {
  loading.value = true;
  try {
    [users.value, stats.value] = await Promise.all([adminApi.getUsers(), adminApi.getStats()]);
  } finally {
    loading.value = false;
  }
}

async function toggleBlock(id: string) {
  await adminApi.blockUser(id);
  await load();
}

async function remove(id: string) {
  await adminApi.deleteUser(id);
  await load();
}

onMounted(load);
</script>
