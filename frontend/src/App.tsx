import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TournamentFormPage } from './pages/TournamentFormPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { PairRegistrationPage } from './pages/PairRegistrationPage';
import { CourtsPage } from './pages/CourtsPage';
import { FixturePage } from './pages/FixturePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/tournaments/new" element={<PrivateRoute><TournamentFormPage /></PrivateRoute>} />
          <Route path="/tournaments/:id" element={<PrivateRoute><TournamentDetailPage /></PrivateRoute>} />
          <Route path="/tournaments/:id/pairs/new" element={<PrivateRoute><PairRegistrationPage /></PrivateRoute>} />
          <Route path="/tournaments/:id/pairs/:pairId/edit" element={<PrivateRoute><PairRegistrationPage /></PrivateRoute>} />
          <Route path="/tournaments/:id/courts" element={<PrivateRoute><CourtsPage /></PrivateRoute>} />
          <Route path="/tournaments/:id/fixture" element={<PrivateRoute><FixturePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
