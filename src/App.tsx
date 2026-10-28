import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DonatePage from './pages/DonatePage';
import FindDonationsPage from './pages/FindDonationsPage';
import MyDonationsPage from './pages/MyDonationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / App Shell Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/find" element={<FindDonationsPage />} />
            <Route path="/my-donations" element={<MyDonationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
