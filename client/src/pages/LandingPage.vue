<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Декоративная наковальня-свечение -->
    <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
      <div class="ember-pulse mt-[-6rem] h-[28rem] w-[28rem] rounded-full blur-[120px]"
           style="background: radial-gradient(circle, rgba(226,83,43,0.32), rgba(226,83,43,0) 70%);" />
    </div>

    <div class="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-10">
      <!-- Шапка -->
      <header class="flex items-center justify-between forge-rise" style="animation-delay: 0ms;">
        <div class="flex items-center gap-2">
          <img src="/logo-icon.png" alt="FORMANIMA" class="h-8 w-8 object-contain" />
          <span class="font-display text-xl tracking-tight text-text">FORMANIMA</span>
        </div>
        <UiButton variant="ghost" size="sm" to="/login">Войти</UiButton>
      </header>

      <!-- Hero -->
      <section class="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p class="forge-rise mb-6 font-stat text-[11px] uppercase tracking-[0.45em] text-gold"
           style="animation-delay: 80ms;">
          Кузня&nbsp;характера · Est. MMXXVI
        </p>

        <h1 class="forge-rise font-display font-black leading-[0.92] tracking-tight"
            style="animation-delay: 140ms; font-size: clamp(2.5rem, 12vw, 8rem);">
          <span class="bg-gradient-to-b from-[#f6ead2] to-[#cdab6f] bg-clip-text text-transparent">FORM</span><span class="text-primary">ANIMA</span>
        </h1>

        <p class="forge-rise mt-4 font-display text-2xl italic text-gold/90"
           style="animation-delay: 200ms;">
          Выкуй свою душу
        </p>

        <p class="forge-rise mx-auto mt-7 max-w-xl text-base leading-relaxed text-text-muted"
           style="animation-delay: 260ms;">
          Создавай привычки, фиксируй ежедневные действия и превращай дисциплину
          в осязаемый прогресс. Каждый отмеченный день — удар молота по характеру.
        </p>

        <div class="forge-rise mt-10 flex flex-wrap items-center justify-center gap-4"
             style="animation-delay: 320ms;">
          <UiButton size="lg" to="/register">
            <Hammer class="h-5 w-5" />
            Начать ковку
          </UiButton>
          <UiButton variant="outlined" size="lg" to="/login">
            У меня есть аккаунт
          </UiButton>
        </div>
      </section>

      <!-- Возможности -->
      <section class="grid gap-4 sm:grid-cols-3">
        <article
          v-for="(feature, i) in features"
          :key="feature.title"
          class="forge-rise forge-card group rounded-2xl p-6 text-left transition-transform duration-300 hover:-translate-y-1"
          :style="`animation-delay: ${380 + i * 90}ms;`"
        >
          <div
            class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-colors"
            :style="`background:${feature.color}1a; border-color:${feature.color}33; color:${feature.color};`"
          >
            <component :is="feature.icon" class="h-6 w-6" />
          </div>
          <h3 class="font-display text-lg text-text">{{ feature.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-text-muted">{{ feature.text }}</p>
        </article>
      </section>

      <!-- Путь мастерства -->
      <section class="forge-rise mt-12" style="animation-delay: 660ms;">
        <div class="mb-5 flex items-center gap-4">
          <hr class="forge-rule flex-1" />
          <span class="font-stat text-[11px] uppercase tracking-[0.3em] text-text-faint">Путь мастерства</span>
          <hr class="forge-rule flex-1" />
        </div>
        <div class="flex items-stretch justify-between gap-2">
          <template v-for="(rank, i) in ranks" :key="rank.label">
            <div class="flex flex-1 flex-col items-center gap-2 text-center">
              <div class="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface text-gold">
                <component :is="rank.icon" class="h-5 w-5" />
              </div>
              <span class="text-[11px] font-medium text-text-muted sm:text-xs">{{ rank.label }}</span>
            </div>
            <div v-if="i < ranks.length - 1" class="flex flex-1 items-center pb-6">
              <hr class="forge-rule w-full" />
            </div>
          </template>
        </div>
      </section>

      <footer class="mt-12 pt-6 text-center text-xs text-text-faint">
        FORMANIMA — дипломный проект · Forge Your Soul
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListChecks, Trophy, BarChart3, Hammer, Wrench, Crown } from 'lucide-vue-next';
import { UiButton } from '../components/ui';

const features = [
  {
    icon: ListChecks,
    title: 'Привычки',
    text: 'Создавай привычки с подзадачами. Отмечай выполнение каждый день одним нажатием.',
    color: '#e2532b',
  },
  {
    icon: Trophy,
    title: 'Геймификация',
    text: 'Зарабатывай XP, повышай уровень и открывай достижения. От Подмастерья до Гроссмейстера.',
    color: '#e0aa4e',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    text: 'Графики выполнений, streak-статистика и heatmap в стиле GitHub для каждой привычки.',
    color: '#86a861',
  },
];

const ranks = [
  { icon: Hammer, label: 'Подмастерье' },
  { icon: Wrench, label: 'Ремесленник' },
  { icon: Trophy, label: 'Мастер' },
  { icon: Crown, label: 'Гроссмейстер' },
];
</script>
