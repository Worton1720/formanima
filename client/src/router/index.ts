import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../pages/LandingPage.vue') },
    { path: '/login', component: () => import('../pages/LoginPage.vue') },
    { path: '/register', component: () => import('../pages/RegisterPage.vue') },
    {
      path: '/dashboard',
      component: () => import('../pages/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/habits',
      component: () => import('../pages/HabitsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Привычки объединены с целями (type='habit'); деталь — общая страница цели.
      path: '/habits/:id',
      redirect: (to) => ({ path: `/goals/${to.params.id}` }),
    },
    {
      path: '/profile',
      component: () => import('../pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/achievements',
      component: () => import('../pages/AchievementsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/analytics',
      component: () => import('../pages/AnalyticsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/finance',
      component: () => import('../pages/FinancePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/goals',
      name: 'Goals',
      component: () => import('../pages/GoalsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/goals/archive',
      name: 'GoalsArchive',
      component: () => import('../pages/ArchivePage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/goals/:id',
      name: 'GoalDetail',
      component: () => import('../pages/GoalDetailPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/calories',
      name: 'Calories',
      component: () => import('../pages/CaloriesPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('../pages/AdminPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }
  if (to.meta.requiresAdmin && auth.userRole !== 'admin') {
    return '/dashboard';
  }
  if ((to.path === '/login' || to.path === '/register' || to.path === '/') && auth.isAuthenticated) {
    return '/dashboard';
  }
});

export default router;
