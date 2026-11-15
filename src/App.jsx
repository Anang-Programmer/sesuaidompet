import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { SawSessionProvider } from './context/SawSessionProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Kriteria from './pages/Kriteria';
import Alternatif from './pages/Alternatif';
import Penilaian from './pages/Penilaian';
import Perhitungan from './pages/Perhitungan';
import Bandingkan from './pages/Bandingkan';
import SedoAI from './pages/SedoAI';
import Hasil from './pages/Hasil';
import Riwayat from './pages/Riwayat';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SawSessionProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kriteria" element={<Kriteria />} />
                <Route path="/alternatif" element={<Alternatif />} />
                <Route path="/penilaian" element={<Penilaian />} />
                <Route path="/bandingkan" element={<Bandingkan />} />
                <Route path="/sedo-ai" element={<SedoAI />} />
                <Route path="/perhitungan" element={<Perhitungan />} />
                <Route path="/hasil" element={<Hasil />} />
                <Route path="/riwayat" element={<Riwayat />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SawSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
