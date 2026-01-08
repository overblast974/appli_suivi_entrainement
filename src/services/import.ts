import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import type { TrainingSession, AppData, SessionType } from '../types/training';

/**
 * Import Service - Gère l'import des données depuis Excel, CSV et JSON
 */

const SESSION_TYPES: SessionType[] = [
  'EF',
  'VMA',
  'Tempo',
  'Sortie longue',
  'Renfo général',
  'Renfo prévention genou',
  'Côtes/Descente',
  'Récup',
];

/**
 * Validate and normalize session type
 */
function normalizeSessionType(type: string): SessionType {
  const normalized = type.trim();
  if (SESSION_TYPES.includes(normalized as SessionType)) {
    return normalized as SessionType;
  }
  // Default to 'EF' if invalid
  return 'EF';
}

/**
 * Parse date string to ISO format (YYYY-MM-DD)
 */
function parseDate(dateStr: string): string {
  try {
    // Try parsing French format (DD/MM/YYYY)
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    // Try parsing ISO format
    if (dateStr.includes('-')) {
      return dateStr.split('T')[0]; // Remove time if present
    }
    // Default to today
    return new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Validate duration format (HH:MM)
 */
function normalizeDuration(duration: string): string {
  const cleaned = duration.trim();
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const [hours, minutes] = cleaned.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  return '00:00';
}

/**
 * Import sessions from Excel or CSV file
 */
export async function importFromFile(file: File): Promise<TrainingSession[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Fichier vide');
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

        if (rows.length === 0) {
          throw new Error('Aucune donnée trouvée dans le fichier');
        }

        const sessions: TrainingSession[] = rows.map((row) => {
          // Map Excel/CSV columns to TrainingSession
          return {
            id: uuidv4(),
            date: parseDate(String(row['Date'] || row['date'] || '')),
            type: normalizeSessionType(String(row['Type'] || row['type'] || 'EF')),
            distance: Number(row['Distance (km)'] || row['distance'] || 0),
            denivele_positif: Number(row['D+ (m)'] || row['denivele_positif'] || 0),
            denivele_negatif: Number(row['D- (m)'] || row['denivele_negatif'] || 0),
            duree: normalizeDuration(String(row['Durée'] || row['duree'] || '00:00')),
            sensation_rotule: Number(row['Sensation rotule'] || row['sensation_rotule'] || 5),
            moment_gene: String(row['Moment gêne'] || row['moment_gene'] || ''),
            temps_recup: String(row['Temps récup'] || row['temps_recup'] || ''),
            notes: String(row['Notes'] || row['notes'] || ''),
            chaussures: String(row['Chaussures'] || row['chaussures'] || 'Chaussures par défaut'),
          };
        });

        resolve(sessions);
      } catch (error) {
        reject(new Error(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Import complete app data from JSON backup
 */
export async function importFromJSON(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Fichier vide');
        }

        const parsed = JSON.parse(String(data));

        // Validate structure
        if (!parsed.data || !parsed.data.sessions) {
          throw new Error('Format de fichier invalide');
        }

        const appData: AppData = parsed.data;

        // Validate required fields
        if (!Array.isArray(appData.sessions)) {
          throw new Error('Format de données invalide');
        }

        resolve(appData);
      } catch (error) {
        reject(new Error(`Erreur lors de l'import JSON: ${error instanceof Error ? error.message : 'erreur inconnue'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validate imported sessions
 */
export function validateSessions(sessions: TrainingSession[]): { valid: TrainingSession[]; errors: string[] } {
  const valid: TrainingSession[] = [];
  const errors: string[] = [];

  sessions.forEach((session, index) => {
    const sessionErrors: string[] = [];

    // Validate required fields
    if (!session.date) {
      sessionErrors.push(`Ligne ${index + 1}: Date manquante`);
    }
    if (!session.type) {
      sessionErrors.push(`Ligne ${index + 1}: Type manquant`);
    }
    if (session.distance < 0) {
      sessionErrors.push(`Ligne ${index + 1}: Distance négative`);
    }
    if (session.sensation_rotule < 0 || session.sensation_rotule > 10) {
      sessionErrors.push(`Ligne ${index + 1}: Sensation rotule doit être entre 0 et 10`);
    }

    if (sessionErrors.length === 0) {
      valid.push(session);
    } else {
      errors.push(...sessionErrors);
    }
  });

  return { valid, errors };
}
