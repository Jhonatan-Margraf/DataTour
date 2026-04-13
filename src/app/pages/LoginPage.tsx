import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";

type Mode = "login" | "signup";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-40 h-40 mb-2 !bg-transparent"
          >
            <img src="/logo.png" alt="Data Tour" className="w-30 h-30 object-contain" />
          </motion.div>
          <h1 className="text-4xl text-white mb-2">Data Tour</h1>

        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-2xl"
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-zinc-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-md transition-all text-sm ${
                !isSignup
                  ? "bg-white text-[#0082C4] shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-md transition-all text-sm ${
                isSignup
                  ? "bg-white text-[#0082C4] shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Criar conta
            </button>
          </div>

          <h2 className="text-2xl mb-6">
            {isSignup ? "Criar nova conta" : "Login"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="block text-sm mb-2 text-zinc-700">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0082C4] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm mb-2 text-zinc-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0082C4] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-zinc-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0082C4] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-xl bg-[#0082C4] hover:bg-[#006a9e] transition-colors"
            >
              {isSignup ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
