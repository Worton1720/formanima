<template>
  <div class="min-h-screen flex flex-col justify-center py-16 px-4 overflow-x-hidden" style="background: #0f0f0f;">
    <!-- Hero -->
    <div class="text-center mb-16 max-w-2xl mx-auto">
      <h1 class="text-5xl font-bold mb-2" style="color: #6366f1;">FORMANIMA</h1>
      <p class="text-xl mb-3" style="color: rgba(255,255,255,0.5);">Forge Your Soul</p>
      <p class="text-base mb-8 mx-auto" style="color: rgba(255,255,255,0.5); max-width: 480px;">
        Создавай привычки, фиксируй ежедневные действия и превращай дисциплину в геймификацию.
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <UiButton size="lg" to="/register">Начать бесплатно</UiButton>
        <UiButton variant="outlined" size="lg" to="/login">Войти</UiButton>
      </div>
    </div>

    <!-- Features -->
    <div class="max-w-4xl mx-auto grid grid-cols-1 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-2xl p-6 text-center"
        :style="`background: ${feature.color}18; border: 1px solid ${feature.color}30;`"
      >
        <component :is="feature.icon" class="w-10 h-10 mx-auto mb-4" :style="`color: ${feature.color};`" />
        <h3 class="text-lg font-bold mb-2">{{ feature.title }}</h3>
        <p class="text-sm" style="color: rgba(255,255,255,0.5);">{{ feature.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListChecks, Trophy, BarChart3 } from 'lucide-vue-next';
import { UiButton } from '../components/ui';

const features = [
  {
    icon: ListChecks,
    title: 'Привычки',
    text: 'Создавай привычки с подзадачами. Отмечай выполнение каждый день одним нажатием.',
    color: '#6366f1',
  },
  {
    icon: Trophy,
    title: 'Геймификация',
    text: 'Зарабатывай XP, повышай уровень и открывай достижения. От Подмастерья до Гроссмейстера.',
    color: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    text: 'Графики выполнений, streak-статистика и GitHub-style heatmap для каждой привычки.',
    color: '#22c55e',
  },
];
</script>
