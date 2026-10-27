import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { FeedbackProvider } from './components/ui';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TournamentFormPage } from './pages/TournamentFormPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { PairRegistrationPage } from './pages/PairRegistrationPage';
import { TournamentVenuesPage } from './pages/TournamentVenuesPage';
import { BracketPage } from './pages/BracketPage';
import { VenuesPage } from './pages/VenuesPage';
import { FixturePage } from './pages/FixturePage';
import { PlayersPage } from './pages/PlayersPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';

function App() {
  return (
    <AuthProvider>
      <FeedbackProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/players" element={<PrivateRoute><PlayersPage /></PrivateRoute>} />
            <Route path="/players/:id" element={<PrivateRoute><PlayerDetailPage /></PrivateRoute>} />
            <Route path="/venues" element={<PrivateRoute><VenuesPage /></PrivateRoute>} />
            <Route path="/tournaments/new"element={<PrivateRoute><TournamentFormPage /></PrivateRoute>} />
            <Route path="/tournaments/:id" element={<PrivateRoute><TournamentDetailPage /></PrivateRoute>} />
            <Route path="/tournaments/:id/pairs/new" element={<PrivateRoute><PairRegistrationPage /></PrivateRoute>} />
            <Route path="/tournaments/:id/pairs/:pairId/edit" element={<PrivateRoute><PairRegistrationPage /></PrivateRoute>} />
            <Route path="/tournaments/:id/venues" element={<PrivateRoute><TournamentVenuesPage /></PrivateRoute>} />
            <Route path="/tournaments/:id/bracket" element={<PrivateRoute><BracketPage /></PrivateRoute>} />
            <Route path="/tournaments/:id/fixture" element={<PrivateRoute><FixturePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </FeedbackProvider>
    </AuthProvider>
  );
}

export default App;
