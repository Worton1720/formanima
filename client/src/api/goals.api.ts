import client from './client';
import type {
  Goal,
  Milestone,
  GoalProgress,
  CreateGoalDto,
  UpdateGoalDto,
  CreateMilestoneDto,
  AddProgressDto,
  RemoveProgressDto,
} from '../types';

export const goalsApi = {
  // Goals CRUD
  getAll: (): Promise<Goal[]> =>
    client.get<Goal[]>('/goals').then((r) => r.data),

  getArchived: (): Promise<Goal[]> =>
    client.get<Goal[]>('/goals/archived').then((r) => r.data),

  getToday: (): Promise<{ goals: Goal[]; progresses: GoalProgress[] }> =>
    client.get<{ goals: Goal[]; progresses: GoalProgress[] }>('/goals/today').then((r) => r.data),

  getOne: (id: string): Promise<Goal> =>
    client.get<Goal>(`/goals/${id}`).then((r) => r.data),

  create: (dto: CreateGoalDto): Promise<Goal> =>
    client.post<Goal>('/goals', dto).then((r) => r.data),

  update: (id: string, dto: UpdateGoalDto): Promise<Goal> =>
    client.patch<Goal>(`/goals/${id}`, dto).then((r) => r.data),

  delete: (id: string): Promise<void> =>
    client.delete(`/goals/${id}`).then(() => undefined),

  archive: (id: string): Promise<Goal> =>
    client.patch<Goal>(`/goals/${id}/archive`).then((r) => r.data),

  restore: (id: string): Promise<Goal> =>
    client.patch<Goal>(`/goals/${id}/restore`).then((r) => r.data),

  // Milestones
  getMilestones: (goalId: string): Promise<Milestone[]> =>
    client.get<Milestone[]>(`/goals/${goalId}/milestones`).then((r) => r.data),

  createMilestone: (goalId: string, dto: CreateMilestoneDto): Promise<Milestone> =>
    client.post<Milestone>(`/goals/${goalId}/milestones`, dto).then((r) => r.data),

  updateMilestone: (goalId: string, milestoneId: string, dto: Partial<CreateMilestoneDto>): Promise<Milestone> =>
    client.patch<Milestone>(`/goals/${goalId}/milestones/${milestoneId}`, dto).then((r) => r.data),

  deleteMilestone: (goalId: string, milestoneId: string): Promise<void> =>
    client.delete(`/goals/${goalId}/milestones/${milestoneId}`).then(() => undefined),

  completeMilestone: (goalId: string, milestoneId: string): Promise<Milestone> =>
    client.patch<Milestone>(`/goals/${goalId}/milestones/${milestoneId}/complete`).then((r) => r.data),

  // Progress
  addProgress: (goalId: string, dto: AddProgressDto): Promise<GoalProgress> =>
    client.post<GoalProgress>(`/goals/${goalId}/progress`, dto).then((r) => r.data),

  removeProgress: (goalId: string, dto: RemoveProgressDto): Promise<void> =>
    client.delete(`/goals/${goalId}/progress`, { data: dto }).then(() => undefined),

  getProgress: (goalId: string, params?: { startDate?: string; endDate?: string }): Promise<GoalProgress[]> =>
    client.get<GoalProgress[]>(`/goals/${goalId}/progress`, { params }).then((r) => r.data),
};
