<template>
  <v-card rounded="xl" variant="tonal" color="surface-variant" class="mb-4">
    <v-card-text class="d-flex align-center ga-3">
      <v-icon icon="mdi-anvil" color="primary" size="28" />
      <p class="text-body-2 font-weight-medium font-italic flex-grow-1 ma-0">
        "{{ quote }}"
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

const QUOTES = [
  'Каждый удар молота — шаг к совершенству',
  'Железо куётся, пока горячо. Привычки — пока есть воля',
  'Форма не дарится — она выковывается',
  'Один пропущенный день — трещина в броне',
  'Мастер начинал подмастерьем',
  'Настоящая сила — в ежедневном труде',
  'Кузница характера открыта каждый день',
  'Не ищи лёгкий путь — ищи правильный',
  'Твои привычки — твоё оружие',
  'Повторение — мать умения. Сила — мать побед',
  'Каждое завершённое действие — звено в цепи',
  'Дисциплина — это свобода в другой форме',
  'Огонь не угасает, пока подбрасываешь дрова',
  'Закалка требует времени, но результат вечен',
  'Великое строится из малых ударов',
  'Упорство точит сталь без огня',
  'Привычка — вторая природа, более сильная, чем первая',
  'Каждый день без прогресса — день без смысла',
  'Мастер виден в деталях, а не в масштабе',
  'Начни. Продолжи. Не останавливайся',
  'Сила воли — мышца: она растёт от нагрузки',
  'Каждое "сегодня" становится "вчера" навсегда',
];

const quote = computed(() => {
  const doy = dayjs().dayOfYear();
  return QUOTES[doy % QUOTES.length];
});
</script>
