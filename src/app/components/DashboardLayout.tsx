import { useState } from "react";
import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  TrendingUp,
  Database,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../hooks/useTheme";
import { AiChat } from "./AiChat";

const SIDEBAR_BG = "#0082C4";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // LOGIN DESATIVADO — handleLogout não redireciona para /login por enquanto

  const navItems = [
    { to: "/", label: "Visão Geral", icon: LayoutDashboard, end: true },
    { to: "/prediction", label: "Predição", icon: TrendingUp },
    { to: "/feedback", label: "Feedbacks", icon: MessageSquare },
    { to: "/sources", label: "Fontes de Dados", icon: Database },
    { to: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-70 text-white flex flex-col"
            style={{ backgroundColor: SIDEBAR_BG }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg">
                    <img src="/logo.png" alt="Data Tour" className="w-10 h-10 object-contain" />
                  </div>
                  <h1 className="text-2xl tracking-tight">Data Tour</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/80 mt-1">Monitoramento de Turismo</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-white text-[#0082C4]"
                          : "text-white/90 hover:bg-[#006a9e] hover:text-white"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={() => { /* login desativado */ }}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-[#006a9e] hover:text-white rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-6 gap-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm">Gestor Data Tour</p>
              <p className="text-xs text-zinc-500">gestor@datatour.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#0082C4] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Chat */}
      <AiChat />
    </div>
  );
}
