<template>
  <div class="min-h-screen flex flex-col" style="background: #0f0f0f; color: rgba(255,255,255,0.87);">
    <!-- Top Bar -->
    <header
      v-if="auth.isAuthenticated"
      class="sticky top-0 z-30 flex-shrink-0"
      style="border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(15,15,15,0.85); backdrop-filter: blur(12px);"
    >
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <router-link
          to="/dashboard"
          class="font-bold text-lg tracking-tight"
          style="color: #6366f1;"
        >
          FORMANIMA
        </router-link>

        <!-- Desktop nav -->
        <nav v-if="isDesktop" class="flex items-center gap-1 ml-4">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :style="isActive(link.to) ? 'color: rgba(255,255,255,0.87); background: rgba(255,255,255,0.1);' : 'color: rgba(255,255,255,0.5);'"
          >
            {{ link.label }}
          </router-link>
          <router-link
            v-if="auth.userRole === 'admin'"
            to="/admin"
            class="px-3 py-1.5 rounded-lg text-sm transition-colors"
            :style="route.path === '/admin' ? 'color: rgba(255,255,255,0.87); background: rgba(255,255,255,0.1);' : 'color: rgba(255,255,255,0.5);'"
          >
            Админ
          </router-link>
        </nav>

        <div class="ml-auto flex items-center gap-1">
          <router-link
            to="/profile"
            class="p-2 rounded-lg transition-colors"
            style="color: rgba(255,255,255,0.5);"
          >
            <User class="w-5 h-5" />
          </router-link>
          <button
            v-if="isMobile"
            class="p-2 rounded-lg transition-colors"
            style="color: rgba(255,255,255,0.5);"
            @click="logout"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1" :class="auth.isAuthenticated && isMobile ? 'pb-16' : ''">
      <slot />
    </main>

    <!-- Mobile Bottom Nav -->
    <nav
      v-if="auth.isAuthenticated && isMobile"
      class="fixed bottom-0 left-0 right-0 z-30 flex"
      style="background: #1a1a1a; border-top: 1px solid rgba(255,255,255,0.08);"
    >
      <router-link
        v-for="link in mobileNavLinks"
        :key="link.to"
        :to="link.to"
        class="flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors"
        :style="isActive(link.to) ? 'color: #6366f1;' : 'color: rgba(255,255,255,0.5);'"
      >
        <component :is="link.icon" class="w-5 h-5" />
        <span class="text-[10px]">{{ link.label }}</span>
      </router-link>
    </nav>

    <!-- Snackbar -->
    <Transition name="fade">
      <div
        v-if="notify.visible.value"
        class="fixed z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-3"
        :class="snackbarColor[notify.color.value ?? 'default']"
        style="bottom: 80px; right: 16px; min-width: 200px;"
      >
        <span class="flex-1">{{ notify.message.value }}</span>
        <button @click="notify.visible.value = false">
          <X class="w-4 h-4" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth.store';
import { useNotify } from '../../composables/useNotify';
import { useBreakpoint } from '../../composables/useBreakpoint';
import { useRoute, useRouter } from 'vue-router';
import { LayoutDashboard, ListChecks, BarChart3, Wallet, User, LogOut, X, Apple } from 'lucide-vue-next';

const auth = useAuthStore();
const notify = useNotify();
const { isMobile, isDesktop } = useBreakpoint();
const route = useRoute();
const router = useRouter();

const navLinks = [
  { to: '/dashboard', label: 'Дашборд' },
  { to: '/habits', label: 'Привычки' },
  { to: '/analytics', label: 'Аналитика' },
  { to: '/finance', label: 'Финансы' },
  { to: '/calories', label: 'Калории' },
];

const mobileNavLinks = [
  { to: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/habits', label: 'Привычки', icon: ListChecks },
  { to: '/finance', label: 'Финансы', icon: Wallet },
  { to: '/calories', label: 'Калории', icon: Apple },
  { to: '/profile', label: 'Профиль', icon: User },
];

const snackbarColor: Record<string, string> = {
  default: 'bg-surface-variant text-text',
  success: 'bg-success/20 text-success',
  error: 'bg-error/20 text-error',
  warning: 'bg-warning/20 text-warning',
};

function isActive(to: string): boolean {
  if (to === '/habits') return route.path.startsWith('/habits');
  return route.path === to;
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
