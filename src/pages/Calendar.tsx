import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

const SESSION_TYPE_COLORS: Record<string, string> = {
  'EF': 'bg-green-500',
  'VMA': 'bg-red-500',
  'Tempo': 'bg-orange-500',
  'Sortie longue': 'bg-blue-500',
  'Renfo général': 'bg-purple-500',
  'Renfo prévention genou': 'bg-pink-500',
  'Côtes/Descente': 'bg-yellow-500',
  'Récup': 'bg-gray-400',
};

export default function Calendar() {
  const { sessions } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const sessionsMap = useMemo(() => {
    const map = new Map<string, typeof sessions>();
    sessions.forEach((session) => {
      const dateKey = session.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(session);
    });
    return map;
  }, [sessions]);

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendrier</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Aujourd'hui
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const daySessions = sessionsMap.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <div
                  key={dateKey}
                  className={`min-h-[80px] p-2 rounded-lg border transition-colors ${
                    isCurrentMonth
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                  } ${today ? 'ring-2 ring-forest-500' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth
                      ? today
                        ? 'text-forest-700 dark:text-forest-500'
                        : 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map((session) => (
                      <Link
                        key={session.id}
                        to={`/session/${session.id}`}
                        className={`block text-xs px-1.5 py-0.5 rounded text-white truncate ${
                          SESSION_TYPE_COLORS[session.type] || 'bg-gray-500'
                        } hover:opacity-80 transition-opacity`}
                        title={`${session.type} - ${session.distance}km`}
                      >
                        {session.type}
                      </Link>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 px-1.5">
                        +{daySessions.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SESSION_TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
