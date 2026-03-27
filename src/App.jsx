import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import CustomersList from './pages/CustomersList';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
        <Route path="/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersList /></ProtectedRoute>} />
        
        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
