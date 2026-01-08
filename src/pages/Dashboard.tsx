import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { useWeeklyStats, useMonthlyStats, useWeeklyVolumeHistory, useVolumeIncreaseAlert } from '../hooks/useStats';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatDateFr } from '../lib/utils';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Activity, Mountain, Clock, Heart } from 'lucide-react';

const COLORS = ['#15803d', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];

export default function Dashboard() {
  const { sessions } = useAppData();
  const weeklyStats = useWeeklyStats(sessions);
  const monthlyStats = useMonthlyStats(sessions);
  const volumeHistory = useWeeklyVolumeHistory(sessions, 8);
  const volumeAlert = useVolumeIncreaseAlert(sessions);

  // Recent sessions (last 5)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Pie chart data for session types
  const sessionTypeData = Object.entries(monthlyStats.sessionsByType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      name: type,
      value: count,
    }));

  // Line chart data for knee feeling evolution (last 10 sessions)
  const kneeFeelingData = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((session) => ({
      date: new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      sensation: session.sensation_rotule,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble de votre entraînement</p>
      </div>

      {/* Volume Alert */}
      {volumeAlert.alert && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600 dark:text-orange-400 w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-800 dark:text-orange-200">
                  Attention : Augmentation du volume hebdomadaire de {volumeAlert.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Il est recommandé de ne pas augmenter le volume de plus de 10% par semaine pour éviter les blessures.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weekly Distance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Semaine</p>
                <p className="text-2xl font-bold text-forest-700 dark:text-forest-500 mt-1">
                  {weeklyStats.totalDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {weeklyStats.sessionCount} séances
                </p>
              </div>
              <Activity className="text-forest-600 dark:text-forest-500 w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Distance */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mois</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {monthlyStats.totalDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {monthlyStats.sessionCount} séances
                </p>
              </div>
              <TrendingUp className="text-blue-600 dark:text-blue-400 w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Elevation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">D+ Semaine</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {weeklyStats.totalElevationGain} m
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  D- {weeklyStats.totalElevationLoss} m
                </p>
              </div>
              <Mountain className="text-purple-600 dark:text-purple-400 w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Knee Feeling */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rotule moy.</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {weeklyStats.averageKneeFeeling.toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cette semaine
                </p>
              </div>
              <Heart className="text-red-600 dark:text-red-400 w-8 h-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution volume hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            {volumeHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="distance" fill="#15803d" name="Distance (km)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Knee Feeling Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution sensation rotule</CardTitle>
          </CardHeader>
          <CardContent>
            {kneeFeelingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={kneeFeelingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sensation" stroke="#ef4444" name="Sensation (0-10)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des types de séances (ce mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionTypeData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sessionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sessionTypeData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Aucune donnée disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dernières séances</CardTitle>
            <Link to="/history" className="text-sm text-forest-600 dark:text-forest-500 hover:underline">
              Voir tout
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/session/${session.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {session.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateFr(session.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {session.distance} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Mountain className="w-4 h-4" />
                          D+ {session.denivele_positif}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duree}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {session.sensation_rotule}/10
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Aucune séance enregistrée
              </p>
              <Link
                to="/new"
                className="inline-flex items-center gap-2 text-forest-600 dark:text-forest-500 hover:underline"
              >
                Ajouter votre première séance
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
