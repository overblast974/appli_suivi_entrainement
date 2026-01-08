import { useMemo } from 'react';
import type { TrainingSession, PeriodStats } from '../types/training';
import { durationToMinutes } from '../lib/utils';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * Hook to calculate statistics from sessions
 */
export function useStats(sessions: TrainingSession[], startDate?: Date, endDate?: Date) {
  return useMemo(() => {
    // Filter sessions by date range if provided
    let filteredSessions = sessions;
    if (startDate && endDate) {
      filteredSessions = sessions.filter((session) => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: startDate, end: endDate });
      });
    }

    // Calculate statistics
    const stats: PeriodStats = {
      totalDistance: 0,
      totalElevationGain: 0,
      totalElevationLoss: 0,
      totalDuration: 0,
      averageKneeFeeling: 0,
      sessionCount: filteredSessions.length,
      sessionsByType: {
        'EF': 0,
        'VMA': 0,
        'Tempo': 0,
        'Sortie longue': 0,
        'Renfo général': 0,
        'Renfo prévention genou': 0,
        'Côtes/Descente': 0,
        'Récup': 0,
      },
    };

    if (filteredSessions.length === 0) {
      return stats;
    }

    let totalKneeFeeling = 0;

    filteredSessions.forEach((session) => {
      stats.totalDistance += session.distance;
      stats.totalElevationGain += session.denivele_positif;
      stats.totalElevationLoss += session.denivele_negatif;
      stats.totalDuration += durationToMinutes(session.duree);
      totalKneeFeeling += session.sensation_rotule;
      stats.sessionsByType[session.type]++;
    });

    stats.averageKneeFeeling = totalKneeFeeling / filteredSessions.length;

    return stats;
  }, [sessions, startDate, endDate]);
}

/**
 * Calculate statistics for a given period
 */
function calculateStats(sessions: TrainingSession[], startDate?: Date, endDate?: Date): PeriodStats {
  // Filter sessions by date range if provided
  let filteredSessions = sessions;
  if (startDate && endDate) {
    filteredSessions = sessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
  }

  // Calculate statistics
  const stats: PeriodStats = {
    totalDistance: 0,
    totalElevationGain: 0,
    totalElevationLoss: 0,
    totalDuration: 0,
    averageKneeFeeling: 0,
    sessionCount: filteredSessions.length,
    sessionsByType: {
      'EF': 0,
      'VMA': 0,
      'Tempo': 0,
      'Sortie longue': 0,
      'Renfo général': 0,
      'Renfo prévention genou': 0,
      'Côtes/Descente': 0,
      'Récup': 0,
    },
  };

  if (filteredSessions.length === 0) {
    return stats;
  }

  let totalKneeFeeling = 0;

  filteredSessions.forEach((session) => {
    stats.totalDistance += session.distance;
    stats.totalElevationGain += session.denivele_positif;
    stats.totalElevationLoss += session.denivele_negatif;
    stats.totalDuration += durationToMinutes(session.duree);
    totalKneeFeeling += session.sensation_rotule;
    stats.sessionsByType[session.type]++;
  });

  stats.averageKneeFeeling = totalKneeFeeling / filteredSessions.length;

  return stats;
}

/**
 * Hook to get weekly statistics
 */
export function useWeeklyStats(sessions: TrainingSession[], date: Date = new Date()) {
  return useMemo(() => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    return calculateStats(sessions, weekStart, weekEnd);
  }, [sessions, date]);
}

/**
 * Hook to get monthly statistics
 */
export function useMonthlyStats(sessions: TrainingSession[], date: Date = new Date()) {
  return useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return calculateStats(sessions, monthStart, monthEnd);
  }, [sessions, date]);
}

/**
 * Hook to get weekly volume history for charts
 */
export function useWeeklyVolumeHistory(sessions: TrainingSession[], weeks: number = 12) {
  return useMemo(() => {
    const now = new Date();
    const history: { week: string; distance: number; elevation: number }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - i * 7);

      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });

      const weekSessions = sessions.filter((session) => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
      });

      const distance = weekSessions.reduce((sum, s) => sum + s.distance, 0);
      const elevation = weekSessions.reduce((sum, s) => sum + s.denivele_positif, 0);

      const weekLabel = `S${weekStart.getDate()}/${weekStart.getMonth() + 1}`;

      history.push({
        week: weekLabel,
        distance: Math.round(distance * 10) / 10,
        elevation: Math.round(elevation),
      });
    }

    return history;
  }, [sessions, weeks]);
}

/**
 * Hook to check for volume increase alert
 */
export function useVolumeIncreaseAlert(sessions: TrainingSession[]): { alert: boolean; percentage: number } {
  return useMemo(() => {
    const now = new Date();

    // Current week
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Previous week
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

    const currentWeekSessions = sessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: currentWeekStart, end: currentWeekEnd });
    });

    const previousWeekSessions = sessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: previousWeekStart, end: previousWeekEnd });
    });

    const currentVolume = currentWeekSessions.reduce((sum, s) => sum + s.distance, 0);
    const previousVolume = previousWeekSessions.reduce((sum, s) => sum + s.distance, 0);

    if (previousVolume === 0) {
      return { alert: false, percentage: 0 };
    }

    const percentage = ((currentVolume - previousVolume) / previousVolume) * 100;
    const alert = percentage > 10;

    return { alert, percentage: Math.round(percentage * 10) / 10 };
  }, [sessions]);
}
