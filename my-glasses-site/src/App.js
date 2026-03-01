import { useState } from 'react';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [page, setPage]               = useState('store');
  const [currentProduct, setProduct]  = useState(null);

  const navigate = (target, data = {}) => {
    setPage(target);
    if (data.product) setProduct(data.product);
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
        <Navbar navigate={navigate} currentPage={page} />

        {page === 'store'   && <StorePage   navigate={navigate} />}
        {page === 'product' && <ProductPage navigate={navigate} product={currentProduct} />}
        {page === 'auth'    && <AuthPage    navigate={navigate} />}
        {page === 'profile' && <ProfilePage navigate={navigate} />}
        {page === 'admin'   && <AdminPage   navigate={navigate} />}
      </div>
    </AuthProvider>
  );
}
