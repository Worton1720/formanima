import client from './client';
import type { GamificationProfile } from '../types';

export const gamificationApi = {
  getProfile: (): Promise<GamificationProfile> =>
    client.get<GamificationProfile>('/gamification/profile').then((r) => r.data),
};
