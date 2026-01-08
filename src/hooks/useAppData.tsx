import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppData, TrainingSession, Shoe, Goal, AppSettings } from '../types/training';
import { storageService } from '../services/storage';

interface AppDataContextType {
  // Data
  sessions: TrainingSession[];
  shoes: Shoe[];
  goals: Goal[];
  settings: AppSettings;

  // Session operations
  addSession: (session: TrainingSession) => Promise<boolean>;
  updateSession: (id: string, updates: Partial<TrainingSession>) => Promise<boolean>;
  deleteSession: (id: string) => Promise<boolean>;
  getSession: (id: string) => TrainingSession | undefined;

  // Shoe operations
  addShoe: (shoe: Shoe) => Promise<boolean>;
  updateShoe: (id: string, updates: Partial<Shoe>) => Promise<boolean>;
  deleteShoe: (id: string) => Promise<boolean>;

  // Goal operations
  addGoal: (goal: Goal) => Promise<boolean>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;

  // Settings operations
  updateSettings: (updates: Partial<AppSettings>) => Promise<boolean>;

  // Data operations
  importData: (data: AppData) => Promise<boolean>;
  clearAllData: () => Promise<boolean>;
  refreshData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => storageService.getData());

  // Refresh data from storage
  const refreshData = () => {
    setData(storageService.getData());
  };

  // Session operations
  const addSession = async (session: TrainingSession): Promise<boolean> => {
    const success = storageService.addSession(session);
    if (success) {
      refreshData();
    }
    return success;
  };

  const updateSession = async (id: string, updates: Partial<TrainingSession>): Promise<boolean> => {
    const success = storageService.updateSession(id, updates);
    if (success) {
      refreshData();
    }
    return success;
  };

  const deleteSession = async (id: string): Promise<boolean> => {
    const success = storageService.deleteSession(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  const getSession = (id: string): TrainingSession | undefined => {
    return data.sessions.find((s) => s.id === id);
  };

  // Shoe operations
  const addShoe = async (shoe: Shoe): Promise<boolean> => {
    const success = storageService.addShoe(shoe);
    if (success) {
      refreshData();
    }
    return success;
  };

  const updateShoe = async (id: string, updates: Partial<Shoe>): Promise<boolean> => {
    const success = storageService.updateShoe(id, updates);
    if (success) {
      refreshData();
    }
    return success;
  };

  const deleteShoe = async (id: string): Promise<boolean> => {
    const success = storageService.deleteShoe(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  // Goal operations
  const addGoal = async (goal: Goal): Promise<boolean> => {
    const success = storageService.addGoal(goal);
    if (success) {
      refreshData();
    }
    return success;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<boolean> => {
    const success = storageService.updateGoal(id, updates);
    if (success) {
      refreshData();
    }
    return success;
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    const success = storageService.deleteGoal(id);
    if (success) {
      refreshData();
    }
    return success;
  };

  // Settings operations
  const updateSettings = async (updates: Partial<AppSettings>): Promise<boolean> => {
    const success = storageService.updateSettings(updates);
    if (success) {
      refreshData();
    }
    return success;
  };

  // Data operations
  const importData = async (newData: AppData): Promise<boolean> => {
    const success = storageService.saveData(newData);
    if (success) {
      refreshData();
    }
    return success;
  };

  const clearAllData = async (): Promise<boolean> => {
    const success = storageService.clearData();
    if (success) {
      refreshData();
    }
    return success;
  };

  // Apply dark mode from settings
  useEffect(() => {
    if (data.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.darkMode]);

  const value: AppDataContextType = {
    sessions: data.sessions,
    shoes: data.shoes,
    goals: data.goals,
    settings: data.settings,
    addSession,
    updateSession,
    deleteSession,
    getSession,
    addShoe,
    updateShoe,
    deleteShoe,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSettings,
    importData,
    clearAllData,
    refreshData,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
