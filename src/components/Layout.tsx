import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, History, Settings, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/history', icon: History, label: 'Historique' },
  { to: '/new', icon: Plus, label: 'Nouveau' },
  { to: '/calendar', icon: Calendar, label: 'Calendrier' },
  { to: '/settings', icon: Settings, label: 'Paramètres' },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-xl font-bold text-forest-700 dark:text-forest-500">
            🏃 Carnet d'entraînement
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 max-w-7xl">
        {children}
      </main>

      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  'min-w-[60px] min-h-[44px]', // Mobile touch target
                  isActive
                    ? 'text-forest-700 dark:text-forest-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-6 h-6',
                      item.to === '/new' && 'w-7 h-7',
                      isActive && item.to === '/new' && 'text-forest-700 dark:text-forest-500'
                    )}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
