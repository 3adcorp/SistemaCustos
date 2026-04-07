import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50'
      : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex flex-col md:flex-row">
      {/* Top bar (mobile) */}
      <header
        className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 shadow-sm border-b border-rose-100 z-30"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent truncate">
            Sistema de Custos
          </h1>
          <p className="text-[11px] text-rose-500 font-medium">Gestão Inteligente</p>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm text-xl"
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden md:block w-64 bg-white/80 backdrop-blur-sm shadow-xl fixed h-full border-r border-rose-200/50">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-rose-100 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100">
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Sistema de Custos
            </h1>
            <p className="text-xs text-rose-500 mt-1 font-medium">Gestão Inteligente</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/dashboard')}`}
            >
              <span className="mr-3 text-lg">📊</span>
              Dashboard
            </Link>
            <Link
              to="/ingredientes"
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/ingredientes')}`}
            >
              <span className="mr-3 text-lg">📦</span>
              Ingredientes
            </Link>
            <div className="space-y-1">
              <p className="px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
                Receitas
              </p>
              <Link
                to="/receitas/recheios"
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/recheios' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
              >
                <span className="mr-2 text-base">🥄</span>
                Recheios
              </Link>
              <Link
                to="/receitas/bolos"
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/bolos' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
              >
                <span className="mr-2 text-base">🍰</span>
                Bolos
              </Link>
              <Link
                to="/receitas/sobremesas"
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/sobremesas' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
              >
                <span className="mr-2 text-base">🍨</span>
                Sobremesas
              </Link>
            </div>
            <div className="space-y-1 mt-2">
              <p className="px-4 py-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                WhatsApp
              </p>
              <Link
                to="/bolos-do-dia"
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${isActive('/bolos-do-dia')}`}
              >
                <span className="mr-2 text-base">🎂</span>
                Bolos do Dia
              </Link>
              <Link
                to="/pedidos"
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${isActive('/pedidos')}`}
              >
                <span className="mr-2 text-base">📋</span>
                Pedidos
              </Link>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-rose-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600 transition-all duration-200"
            >
              <span className="mr-3 text-lg">🚪</span>
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar mobile (overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-white/95 backdrop-blur-sm shadow-xl h-full border-r border-rose-200/50 flex flex-col">
            <div className="p-6 border-b border-rose-100 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Sistema de Custos
                </h1>
                <p className="text-[11px] text-rose-500 mt-1 font-medium">Gestão Inteligente</p>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-rose-700 text-2xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/50"
                aria-label="Fechar menu"
              >
                ×
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
<Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/dashboard')}`}
              >
                <span className="mr-3 text-lg">📊</span>
                Dashboard
              </Link>
<Link
              to="/ingredientes"
              onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 ${isActive('/ingredientes')}`}
              >
                <span className="mr-3 text-lg">📦</span>
                Ingredientes
              </Link>
              <div className="space-y-1">
                <p className="px-4 py-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Receitas
                </p>
                <Link
                  to="/receitas/recheios"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/recheios' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
                >
                  <span className="mr-2 text-base">🥄</span>
                  Recheios
                </Link>
                <Link
                  to="/receitas/bolos"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/bolos' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
                >
                  <span className="mr-2 text-base">🍰</span>
                  Bolos
                </Link>
                <Link
                  to="/receitas/sobremesas"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${location.pathname === '/receitas/sobremesas' ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg shadow-rose-200/50' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600'}`}
                >
                  <span className="mr-2 text-base">🍨</span>
                  Sobremesas
                </Link>
              </div>
              <div className="space-y-1 mt-2">
                <p className="px-4 py-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  WhatsApp
                </p>
                <Link
                  to="/bolos-do-dia"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${isActive('/bolos-do-dia')}`}
                >
                  <span className="mr-2 text-base">🎂</span>
                  Bolos do Dia
                </Link>
                <Link
                  to="/pedidos"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all duration-200 ml-2 ${isActive('/pedidos')}`}
                >
                  <span className="mr-2 text-base">📋</span>
                  Pedidos
                </Link>
              </div>
            </nav>
            <div className="p-4 border-t border-rose-100">
              <button
                onClick={async () => {
                  await handleLogout();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600 transition-all duration-200"
              >
                <span className="mr-3 text-lg">🚪</span>
                Sair
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      {/* Main Content */}
      <main
        className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-0 overflow-auto"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

