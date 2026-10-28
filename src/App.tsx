import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import RequireOwner from './auth/RequireOwner';
import Desk from './screens/Desk';
import Catch from './screens/Catch';
import Pages from './screens/Pages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RequireOwner>
          <Routes>
            <Route path="/" element={<Desk />} />
            <Route path="/catch" element={<Catch />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RequireOwner>
      </BrowserRouter>
    </AuthProvider>
  );
}
