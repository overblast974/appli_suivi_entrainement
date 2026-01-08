import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import type { SessionType } from '../types/training';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Select from '../components/ui/Select';
import { formatDateFr } from '../lib/utils';
import { Activity, Mountain, Clock, Heart, Filter, X } from 'lucide-react';
import Button from '../components/ui/Button';

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

type Period = 'all' | 'week' | 'month' | 'custom';

export default function History() {
  const { sessions } = useAppData();
  const [selectedType, setSelectedType] = useState<SessionType | 'all'>('all');
  const [period, setPeriod] = useState<Period>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'distance-desc' | 'distance-asc'>('date-desc');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((s) => s.type === selectedType);
    }

    // Filter by period
    const now = new Date();
    if (period === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((s) => new Date(s.date) >= oneWeekAgo);
    } else if (period === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((s) => new Date(s.date) >= oneMonthAgo);
    }

    // Sort
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'distance-desc') {
      filtered.sort((a, b) => b.distance - a.distance);
    } else if (sortBy === 'distance-asc') {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [sessions, selectedType, period, sortBy]);

  const totalStats = useMemo(() => {
    const total = filteredSessions.reduce(
      (acc, session) => ({
        distance: acc.distance + session.distance,
        elevation: acc.elevation + session.denivele_positif,
        count: acc.count + 1,
      }),
      { distance: 0, elevation: 0, count: 0 }
    );
    return total;
  }, [filteredSessions]);

  const clearFilters = () => {
    setSelectedType('all');
    setPeriod('all');
  };

  const hasFilters = selectedType !== 'all' || period !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Historique</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {totalStats.count} séance{totalStats.count > 1 ? 's' : ''} • {totalStats.distance.toFixed(1)} km • D+{' '}
          {totalStats.elevation}m
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres
            </CardTitle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type filter */}
            <Select
              label="Type de séance"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as SessionType | 'all')}
              options={[
                { value: 'all', label: 'Tous les types' },
                ...SESSION_TYPES.map((type) => ({ value: type, label: type })),
              ]}
            />

            {/* Period filter */}
            <Select
              label="Période"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              options={[
                { value: 'all', label: 'Toute la période' },
                { value: 'week', label: '7 derniers jours' },
                { value: 'month', label: '30 derniers jours' },
              ]}
            />

            {/* Sort */}
            <Select
              label="Trier par"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              options={[
                { value: 'date-desc', label: 'Date (plus récent)' },
                { value: 'date-asc', label: 'Date (plus ancien)' },
                { value: 'distance-desc', label: 'Distance (décroissant)' },
                { value: 'distance-asc', label: 'Distance (croissant)' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <Link
              key={session.id}
              to={`/session/${session.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {session.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateFr(session.date)}
                        </span>
                        {session.chaussures && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {session.chaussures}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4" />
                          <span className="font-medium">{session.distance} km</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mountain className="w-4 h-4" />
                          <span>D+ {session.denivele_positif}m</span>
                          {session.denivele_negatif > 0 && (
                            <span className="text-gray-400">• D- {session.denivele_negatif}m</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{session.duree}</span>
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {session.notes}
                        </p>
                      )}

                      {session.moment_gene && (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                          ⚠ {session.moment_gene}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                        <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {session.sensation_rotule}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {hasFilters
                  ? 'Aucune séance ne correspond aux filtres sélectionnés'
                  : 'Aucune séance enregistrée'}
              </p>
              {!hasFilters && (
                <Link to="/new">
                  <Button variant="primary">Ajouter une séance</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
