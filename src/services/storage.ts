import type { AppData, TrainingSession, Shoe, Goal, AppSettings } from '../types/training';

const STORAGE_KEY = 'training-journal-data';
const STORAGE_VERSION = '1.0.0';

/**
 * Default application data
 */
const defaultAppData: AppData = {
  sessions: [],
  shoes: [
    {
      id: crypto.randomUUID(),
      name: 'Chaussures par défaut',
      totalKm: 0,
      active: true,
    },
  ],
  goals: [],
  settings: {
    darkMode: false,
    weeklyVolumeIncreaseAlert: true,
    notificationsEnabled: false,
  },
};

/**
 * Storage Service - Gère toutes les opérations de stockage local
 */
class StorageService {
  /**
   * Get all app data from localStorage
   */
  getData(): AppData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return defaultAppData;
      }
      const parsed = JSON.parse(data);
      return parsed.data || defaultAppData;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultAppData;
    }
  }

  /**
   * Save all app data to localStorage
   */
  saveData(data: AppData): boolean {
    try {
      const exportData = {
        version: STORAGE_VERSION,
        lastModified: new Date().toISOString(),
        data,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(exportData));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Clear all data from localStorage
   */
  clearData(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // ============ SESSIONS ============

  /**
   * Get all training sessions
   */
  getSessions(): TrainingSession[] {
    return this.getData().sessions;
  }

  /**
   * Get a single session by ID
   */
  getSession(id: string): TrainingSession | undefined {
    return this.getSessions().find((s) => s.id === id);
  }

  /**
   * Add a new training session
   */
  addSession(session: TrainingSession): boolean {
    try {
      const data = this.getData();
      data.sessions.push(session);

      // Update shoe total km
      const shoe = data.shoes.find((s) => s.name === session.chaussures);
      if (shoe) {
        shoe.totalKm += session.distance;
      }

      return this.saveData(data);
    } catch (error) {
      console.error('Error adding session:', error);
      return false;
    }
  }

  /**
   * Update an existing training session
   */
  updateSession(id: string, updates: Partial<TrainingSession>): boolean {
    try {
      const data = this.getData();
      const index = data.sessions.findIndex((s) => s.id === id);

      if (index === -1) {
        return false;
      }

      const oldSession = data.sessions[index];
      const newSession = { ...oldSession, ...updates };

      // Update shoe total km if distance or shoes changed
      if (oldSession.distance !== newSession.distance || oldSession.chaussures !== newSession.chaussures) {
        // Remove old distance from old shoe
        const oldShoe = data.shoes.find((s) => s.name === oldSession.chaussures);
        if (oldShoe) {
          oldShoe.totalKm -= oldSession.distance;
        }

        // Add new distance to new shoe
        const newShoe = data.shoes.find((s) => s.name === newSession.chaussures);
        if (newShoe) {
          newShoe.totalKm += newSession.distance;
        }
      }

      data.sessions[index] = newSession;
      return this.saveData(data);
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  /**
   * Delete a training session
   */
  deleteSession(id: string): boolean {
    try {
      const data = this.getData();
      const session = data.sessions.find((s) => s.id === id);

      if (!session) {
        return false;
      }

      // Update shoe total km
      const shoe = data.shoes.find((s) => s.name === session.chaussures);
      if (shoe) {
        shoe.totalKm -= session.distance;
      }

      data.sessions = data.sessions.filter((s) => s.id !== id);
      return this.saveData(data);
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // ============ SHOES ============

  /**
   * Get all shoes
   */
  getShoes(): Shoe[] {
    return this.getData().shoes;
  }

  /**
   * Get active shoes only
   */
  getActiveShoes(): Shoe[] {
    return this.getShoes().filter((s) => s.active);
  }

  /**
   * Add a new shoe
   */
  addShoe(shoe: Shoe): boolean {
    try {
      const data = this.getData();
      data.shoes.push(shoe);
      return this.saveData(data);
    } catch (error) {
      console.error('Error adding shoe:', error);
      return false;
    }
  }

  /**
   * Update an existing shoe
   */
  updateShoe(id: string, updates: Partial<Shoe>): boolean {
    try {
      const data = this.getData();
      const index = data.shoes.findIndex((s) => s.id === id);

      if (index === -1) {
        return false;
      }

      data.shoes[index] = { ...data.shoes[index], ...updates };
      return this.saveData(data);
    } catch (error) {
      console.error('Error updating shoe:', error);
      return false;
    }
  }

  /**
   * Delete a shoe
   */
  deleteShoe(id: string): boolean {
    try {
      const data = this.getData();
      data.shoes = data.shoes.filter((s) => s.id !== id);
      return this.saveData(data);
    } catch (error) {
      console.error('Error deleting shoe:', error);
      return false;
    }
  }

  // ============ GOALS ============

  /**
   * Get all goals
   */
  getGoals(): Goal[] {
    return this.getData().goals;
  }

  /**
   * Get active goals only
   */
  getActiveGoals(): Goal[] {
    return this.getGoals().filter((g) => g.active);
  }

  /**
   * Add a new goal
   */
  addGoal(goal: Goal): boolean {
    try {
      const data = this.getData();
      data.goals.push(goal);
      return this.saveData(data);
    } catch (error) {
      console.error('Error adding goal:', error);
      return false;
    }
  }

  /**
   * Update an existing goal
   */
  updateGoal(id: string, updates: Partial<Goal>): boolean {
    try {
      const data = this.getData();
      const index = data.goals.findIndex((g) => g.id === id);

      if (index === -1) {
        return false;
      }

      data.goals[index] = { ...data.goals[index], ...updates };
      return this.saveData(data);
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  }

  /**
   * Delete a goal
   */
  deleteGoal(id: string): boolean {
    try {
      const data = this.getData();
      data.goals = data.goals.filter((g) => g.id !== id);
      return this.saveData(data);
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // ============ SETTINGS ============

  /**
   * Get app settings
   */
  getSettings(): AppSettings {
    return this.getData().settings;
  }

  /**
   * Update app settings
   */
  updateSettings(updates: Partial<AppSettings>): boolean {
    try {
      const data = this.getData();
      data.settings = { ...data.settings, ...updates };
      return this.saveData(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
