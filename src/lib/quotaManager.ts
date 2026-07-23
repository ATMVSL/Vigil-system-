// ══════════════════════════════════════════════════════════════
// VIGIL MEASURABLE QUOTA & RESOURCE CAP MANAGER
// Conserves AI tokens, enforces daily limits, and manages quotas
// ══════════════════════════════════════════════════════════════

export interface QuotaUsage {
  reflectionsToday: number;
  tokensToday: number;
  voiceMinutesToday: number;
  lastResetDate: string;
}

export interface QuotaLimits {
  maxReflectionsPerDay: number;
  maxTokensPerDay: number;
  maxVoiceMinutesPerDay: number;
  maxSessionDurationMinutes: number;
}

const QUOTA_USAGE_KEY = "vigil_quota_usage";

export const DEFAULT_OPERATOR_LIMITS: QuotaLimits = {
  maxReflectionsPerDay: 50,
  maxTokensPerDay: 100000,
  maxVoiceMinutesPerDay: 60,
  maxSessionDurationMinutes: 30,
};

export class QuotaManager {
  private static getTodayKey(): string {
    return new Date().toISOString().split("T")[0];
  }

  static getUsage(): QuotaUsage {
    const today = this.getTodayKey();
    try {
      const data = localStorage.getItem(QUOTA_USAGE_KEY);
      if (data) {
        const parsed: QuotaUsage = JSON.parse(data);
        if (parsed.lastResetDate === today) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Default reset for new day
    const newUsage: QuotaUsage = {
      reflectionsToday: 0,
      tokensToday: 0,
      voiceMinutesToday: 0,
      lastResetDate: today,
    };
    this.saveUsage(newUsage);
    return newUsage;
  }

  private static saveUsage(usage: QuotaUsage): void {
    try {
      localStorage.setItem(QUOTA_USAGE_KEY, JSON.stringify(usage));
    } catch (e) {
      console.warn("Failed to persist quota usage:", e);
    }
  }

  static recordReflection(): QuotaUsage {
    const usage = this.getUsage();
    usage.reflectionsToday += 1;
    this.saveUsage(usage);
    return usage;
  }

  static recordTokens(tokens: number): QuotaUsage {
    const usage = this.getUsage();
    usage.tokensToday += tokens;
    this.saveUsage(usage);
    return usage;
  }

  static recordVoiceMinutes(minutes: number): QuotaUsage {
    const usage = this.getUsage();
    usage.voiceMinutesToday += Math.round(minutes * 10) / 10;
    this.saveUsage(usage);
    return usage;
  }

  static checkCapStatus(limits: QuotaLimits = DEFAULT_OPERATOR_LIMITS): {
    canUseAI: boolean;
    reason?: string;
    reflectionPercent: number;
    tokenPercent: number;
    voicePercent: number;
  } {
    const usage = this.getUsage();
    const reflectionPercent = Math.min(100, Math.round((usage.reflectionsToday / limits.maxReflectionsPerDay) * 100));
    const tokenPercent = Math.min(100, Math.round((usage.tokensToday / limits.maxTokensPerDay) * 100));
    const voicePercent = Math.min(100, Math.round((usage.voiceMinutesToday / limits.maxVoiceMinutesPerDay) * 100));

    if (usage.reflectionsToday >= limits.maxReflectionsPerDay) {
      return {
        canUseAI: false,
        reason: `Daily reflection cap reached (${limits.maxReflectionsPerDay}/day). Transitioning to Offline Doctrine Mode.`,
        reflectionPercent,
        tokenPercent,
        voicePercent,
      };
    }

    if (usage.tokensToday >= limits.maxTokensPerDay) {
      return {
        canUseAI: false,
        reason: `Daily AI token quota reached (${limits.maxTokensPerDay.toLocaleString()} tokens/day). Switching to Offline Mode.`,
        reflectionPercent,
        tokenPercent,
        voicePercent,
      };
    }

    return {
      canUseAI: true,
      reflectionPercent,
      tokenPercent,
      voicePercent,
    };
  }
}
