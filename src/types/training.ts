/**
 * Types pour l'application de carnet d'entraînement
 */

// Type de séance d'entraînement
export type SessionType =
  | 'EF'
  | 'VMA'
  | 'Tempo'
  | 'Sortie longue'
  | 'Renfo général'
  | 'Renfo prévention genou'
  | 'Côtes/Descente'
  | 'Récup';

// Session d'entraînement
export interface TrainingSession {
  id: string;
  date: string; // Format ISO 8601 (YYYY-MM-DD)
  type: SessionType;
  distance: number; // en km
  denivele_positif: number; // en mètres
  denivele_negatif: number; // en mètres
  duree: string; // Format HH:MM
  sensation_rotule: number; // 0-10
  moment_gene?: string; // Optionnel
  temps_recup?: string; // Optionnel
  notes?: string; // Optionnel
  chaussures: string;
}

// Chaussure de course
export interface Shoe {
  id: string;
  name: string;
  totalKm: number;
  purchaseDate?: string;
  active: boolean;
}

// Objectif hebdomadaire ou mensuel
export interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  targetDistance?: number; // en km
  targetElevation?: number; // en mètres (D+)
  startDate: string; // Format ISO 8601
  endDate: string; // Format ISO 8601
  active: boolean;
}

// Statistiques pour une période donnée
export interface PeriodStats {
  totalDistance: number; // en km
  totalElevationGain: number; // D+ en mètres
  totalElevationLoss: number; // D- en mètres
  totalDuration: number; // en minutes
  averageKneeFeeling: number; // Moyenne des sensations rotule
  sessionCount: number;
  sessionsByType: Record<SessionType, number>;
}

// Filtres pour l'historique
export interface SessionFilters {
  startDate?: string;
  endDate?: string;
  sessionTypes?: SessionType[];
  minDistance?: number;
  maxDistance?: number;
  minKneeFeeling?: number;
  maxKneeFeeling?: number;
}

// Données de l'application (structure complète du localStorage)
export interface AppData {
  sessions: TrainingSession[];
  shoes: Shoe[];
  goals: Goal[];
  settings: AppSettings;
}

// Paramètres de l'application
export interface AppSettings {
  darkMode: boolean;
  defaultShoe?: string; // ID de la chaussure par défaut
  weeklyVolumeIncreaseAlert: boolean; // Alerte si augmentation > 10%
  notificationsEnabled: boolean;
}

// Données pour l'export
export interface ExportData {
  exportDate: string;
  version: string;
  data: AppData;
}
