import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import RequireOwner from './auth/RequireOwner';
import Desk from './screens/Desk';
import Catch from './screens/Catch';
import Pages from './screens/Pages';
import SvgDefs from './stickers/SvgDefs';

export default function App() {
  return (
    <AuthProvider>
      <SvgDefs />
      <BrowserRouter>
        <RequireOwner>
          <Routes>
            <Route path="/" element={<Desk />} />
            <Route path="/day/:day" element={<Desk />} />
            <Route path="/catch" element={<Catch />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RequireOwner>
      </BrowserRouter>
    </AuthProvider>
  );
}
