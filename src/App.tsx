import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Ingredientes from './pages/Ingredientes';
import Receitas from './pages/Receitas';
import Dashboard from './pages/Dashboard';
import BolosDoDia from './pages/BolosDoDia';
import Pedidos from './pages/Pedidos';

function App() {
  const [user, loading] = useAuthState(auth);
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  }, [user, setUserId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-lg sm:text-xl font-medium text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ingredientes" element={<Ingredientes />} />
          <Route path="/receitas" element={<Navigate to="/receitas/bolos" replace />} />
          <Route path="/receitas/:tipo" element={<Receitas />} />
          <Route path="/bolos-do-dia" element={<BolosDoDia />} />
          <Route path="/pedidos" element={<Pedidos />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

