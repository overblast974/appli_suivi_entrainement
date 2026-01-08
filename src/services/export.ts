import * as XLSX from 'xlsx';
import type { TrainingSession, AppData } from '../types/training';
import { formatDateFr } from '../lib/utils';

/**
 * Export Service - Gère l'export des données en Excel et CSV
 */

/**
 * Convert sessions to worksheet data
 */
function sessionsToWorksheetData(sessions: TrainingSession[]): unknown[][] {
  const headers = [
    'Date',
    'Type',
    'Distance (km)',
    'D+ (m)',
    'D- (m)',
    'Durée',
    'Sensation rotule',
    'Moment gêne',
    'Temps récup',
    'Notes',
    'Chaussures',
  ];

  const rows = sessions.map((session) => [
    formatDateFr(session.date),
    session.type,
    session.distance,
    session.denivele_positif,
    session.denivele_negatif,
    session.duree,
    session.sensation_rotule,
    session.moment_gene || '',
    session.temps_recup || '',
    session.notes || '',
    session.chaussures,
  ]);

  return [headers, ...rows];
}

/**
 * Export sessions to Excel file (.xlsx)
 */
export function exportToExcel(sessions: TrainingSession[], filename?: string): void {
  try {
    // Create worksheet data
    const data = sessionsToWorksheetData(sessions);

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Séances');

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 22 }, // Type
      { wch: 12 }, // Distance
      { wch: 10 }, // D+
      { wch: 10 }, // D-
      { wch: 10 }, // Durée
      { wch: 15 }, // Sensation rotule
      { wch: 20 }, // Moment gêne
      { wch: 15 }, // Temps récup
      { wch: 30 }, // Notes
      { wch: 20 }, // Chaussures
    ];

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const finalFilename = filename || `carnet_entrainement_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, finalFilename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Erreur lors de l\'export Excel');
  }
}

/**
 * Export sessions to CSV file
 */
export function exportToCSV(sessions: TrainingSession[], filename?: string): void {
  try {
    // Create CSV data
    const data = sessionsToWorksheetData(sessions);
    const ws = XLSX.utils.aoa_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const finalFilename = filename || `carnet_entrainement_${date}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Erreur lors de l\'export CSV');
  }
}

/**
 * Export all app data as JSON
 */
export function exportToJSON(data: AppData, filename?: string): void {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      data,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const finalFilename = filename || `carnet_entrainement_backup_${date}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', finalFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Erreur lors de l\'export JSON');
  }
}
