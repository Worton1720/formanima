import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  }

  // ─── Subscription management ─────────────────────────────────────────────────

  async subscribe(userId: string, dto: SubscribeDto) {
    return this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: dto.endpoint } },
      create: { userId, endpoint: dto.endpoint, p256dh: dto.p256dh, auth: dto.auth },
      update: { p256dh: dto.p256dh, auth: dto.auth },
    });
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
  }

  // ─── Preferences ─────────────────────────────────────────────────────────────

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: { ...dto },
    });
  }

  // ─── Core send ───────────────────────────────────────────────────────────────

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    const subs = await this.prisma.pushSubscription.findMany({ where: { userId } });
    if (subs.length === 0) return;

    const json = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        ),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const err = result.reason as { statusCode?: number };
        if (err.statusCode === 410 || err.statusCode === 404) {
          await this.prisma.pushSubscription.deleteMany({
            where: { userId, endpoint: subs[i].endpoint },
          });
        } else {
          this.logger.warn(`Push failed for userId=${userId}: ${err.statusCode}`);
        }
      }
    }
  }

  // ─── Typed notification methods ───────────────────────────────────────────────

  async notifyAchievementUnlocked(userId: string, achievementName: string): Promise<void> {
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (prefs && !prefs.achievementEnabled) return;
    await this.sendToUser(userId, {
      title: 'Достижение разблокировано!',
      body: `«${achievementName}» — ты это заслужил`,
      icon: '/pwa-192x192.png',
      url: '/achievements',
      tag: 'achievement',
    });
  }

  async notifyLevelUp(userId: string, level: number): Promise<void> {
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (prefs && !prefs.levelUpEnabled) return;
    await this.sendToUser(userId, {
      title: `Уровень ${level}!`,
      body: 'Ты перешёл на новый уровень. Продолжай ковать характер!',
      icon: '/pwa-192x192.png',
      url: '/profile',
      tag: 'levelup',
    });
  }

  // ─── Cron: ежеминутная проверка напоминаний ───────────────────────────────────

  @Cron('* * * * *')
  async handleDailyReminders(): Promise<void> {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const currentHHMM = `${hh}:${mm}`;

    const prefs = await this.prisma.notificationPreference.findMany({
      where: { reminderEnabled: true, reminderTime: currentHHMM },
    });
    if (prefs.length === 0) return;

    await Promise.allSettled(
      prefs.map((pref) =>
        this.sendToUser(pref.userId, {
          title: 'Время для привычек!',
          body: 'Не забудь отметить выполнение сегодня',
          icon: '/pwa-192x192.png',
          url: '/habits',
          tag: 'daily-reminder',
        }),
      ),
    );
  }

  // ─── Cron: серия под угрозой в 21:00 UTC ─────────────────────────────────────

  @Cron('0 21 * * *')
  async handleStreakAtRisk(): Promise<void> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const prefs = await this.prisma.notificationPreference.findMany({
      where: { streakEnabled: true },
    });

    await Promise.allSettled(
      prefs.map(async (pref) => {
        const hadProgressYesterday = await this.prisma.goalProgress.findFirst({
          where: { userId: pref.userId, date: yesterday },
        });
        if (!hadProgressYesterday) return;

        const hasProgressToday = await this.prisma.goalProgress.findFirst({
          where: { userId: pref.userId, date: today },
        });
        if (hasProgressToday) return;

        await this.sendToUser(pref.userId, {
          title: 'Серия под угрозой!',
          body: 'Ты ещё не отметил привычки сегодня. Не теряй streak!',
          icon: '/pwa-192x192.png',
          url: '/habits',
          tag: 'streak-risk',
        });
      }),
    );
  }
}
