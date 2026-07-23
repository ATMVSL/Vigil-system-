// ══════════════════════════════════════════════════════════════
// VIGIL OFFLINE STORAGE & SYNC MANAGER
// Enables full offline access to Training & Mirror operations
// ══════════════════════════════════════════════════════════════

export interface OfflineReflection {
  id: string;
  callsign: string;
  content: string;
  pillar: string;
  cognitiveState: string;
  createdAt: number;
  synced: boolean;
}

export interface OfflineLessonProgress {
  courseId: string;
  lessonId: string;
  progress: number;
  completedAt?: number;
}

const MIRROR_OFFLINE_KEY = "vigil_offline_reflections";
const LESSON_OFFLINE_KEY = "vigil_offline_progress";
const CATALOG_CACHE_KEY = "vigil_cached_catalog";

export class OfflineStorageManager {
  // ─── MIRROR REFLECTIONS ───
  static getOfflineReflections(): OfflineReflection[] {
    try {
      const data = localStorage.getItem(MIRROR_OFFLINE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveOfflineReflection(reflection: Omit<OfflineReflection, "id" | "synced">): OfflineReflection {
    const list = this.getOfflineReflections();
    const newEntry: OfflineReflection = {
      ...reflection,
      id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      synced: false,
    };
    list.unshift(newEntry);
    try {
      localStorage.setItem(MIRROR_OFFLINE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("LocalStorage full, trimming oldest offline entries:", e);
      localStorage.setItem(MIRROR_OFFLINE_KEY, JSON.stringify(list.slice(0, 50)));
    }
    return newEntry;
  }

  static markReflectionsSynced(ids: string[]): void {
    const list = this.getOfflineReflections().filter((r) => !ids.includes(r.id));
    localStorage.setItem(MIRROR_OFFLINE_KEY, JSON.stringify(list));
  }

  // ─── TRAINING & LESSON CACHE ───
  static cacheCatalog(catalogData: any): void {
    try {
      localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
        data: catalogData,
        cachedAt: Date.now(),
      }));
    } catch (e) {
      console.warn("Failed to cache course catalog:", e);
    }
  }

  static getCachedCatalog(): any | null {
    try {
      const cached = localStorage.getItem(CATALOG_CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      return parsed.data;
    } catch {
      return null;
    }
  }

  static saveOfflineProgress(progress: OfflineLessonProgress): void {
    try {
      const existing = this.getOfflineProgress();
      existing.push(progress);
      localStorage.setItem(LESSON_OFFLINE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn("Failed to save offline progress:", e);
    }
  }

  static getOfflineProgress(): OfflineLessonProgress[] {
    try {
      const data = localStorage.getItem(LESSON_OFFLINE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearSyncedProgress(): void {
    localStorage.removeItem(LESSON_OFFLINE_KEY);
  }
}
