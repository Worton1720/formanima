import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { gamificationApi } from '../api/gamification.api';
import type { GamificationProfile } from '../types';

export const useGamificationStore = defineStore('gamification', () => {
  const profile = ref<GamificationProfile | null>(null);
  const loading = ref(false);
  const burstData = ref<GamificationProfile | null>(null);

  async function fetchProfile() {
    loading.value = true;
    try {
      profile.value = await gamificationApi.getProfile();
    } finally {
      loading.value = false;
    }
  }

  function setProfile(data: GamificationProfile) {
    profile.value = data;
  }

  const rank = computed(() => profile.value?.rank ?? 'apprentice');
  const level = computed(() => profile.value?.level ?? 1);
  const unlockedAchievements = computed(
    () => profile.value?.achievements.filter((a) => a.unlocked) ?? [],
  );

  function showBurst(data: GamificationProfile) {
    burstData.value = data;
  }
  function clearBurst() {
    burstData.value = null;
  }

  return { profile, loading, burstData, fetchProfile, setProfile, showBurst, clearBurst, rank, level, unlockedAchievements };
});
