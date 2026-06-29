import client from './client';

export interface PushPreferences {
  id: string;
  userId: string;
  reminderEnabled: boolean;
  reminderTime: string;
  achievementEnabled: boolean;
  streakEnabled: boolean;
  levelUpEnabled: boolean;
}

export const notificationsApi = {
  getVapidPublicKey: (): Promise<{ key: string }> =>
    client.get<{ key: string }>('/notifications/vapid-public-key').then((r) => r.data),

  subscribe: (endpoint: string, p256dh: string, auth: string): Promise<void> =>
    client.post('/notifications/subscribe', { endpoint, p256dh, auth }).then(() => undefined),

  unsubscribe: (endpoint: string): Promise<void> =>
    client.delete('/notifications/unsubscribe', { data: { endpoint } }).then(() => undefined),

  getPreferences: (): Promise<PushPreferences> =>
    client.get<PushPreferences>('/notifications/preferences').then((r) => r.data),

  updatePreferences: (dto: Partial<PushPreferences>): Promise<PushPreferences> =>
    client.put<PushPreferences>('/notifications/preferences', dto).then((r) => r.data),
};
