import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './hooks/useAppData';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import NewSession from './pages/NewSession';
import History from './pages/History';
import SessionDetail from './pages/SessionDetail';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

function App() {
  return (
    <AppDataProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewSession />} />
            <Route path="/history" element={<History />} />
            <Route path="/session/:id" element={<SessionDetail />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </AppDataProvider>
  );
}

export default App;
