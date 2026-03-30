import client from './client';

export const trackingApi = {
  complete: (actionId: string, date: string) =>
    client.post('/tracking/complete', { actionId, date }),
  uncomplete: (actionId: string, date: string) =>
    client.delete('/tracking/complete', { data: { actionId, date } }),
  getStatus: (habitId: string, date: string) =>
    client
      .get<Record<string, boolean>>(`/tracking?habitId=${habitId}&date=${date}`)
      .then((r) => r.data),
};
