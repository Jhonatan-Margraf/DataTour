import { User, Mail, Shield, Bell, Key } from "lucide-react";
import { motion } from "motion/react";

export function ProfilePage() {
  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Perfil</h1>
        <p className="text-zinc-600">Gerencie suas informações e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="lg:col-span-1 bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-[#0082C4] text-white flex items-center justify-center mb-4">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl mb-1">Usuário Admin</h2>
            <p className="text-sm text-zinc-600 mb-4">admin@datahub.com</p>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-sm rounded-full">
              Administrador
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Membro desde</span>
              <span>Jan 2025</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Último acesso</span>
              <span>Hoje, 14:30</span>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Account Information */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-lg">Informações da Conta</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-2">Nome Completo</label>
                <input
                  type="text"
                  defaultValue="Usuário Admin"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0082C4]"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@datahub.com"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0082C4]"
                />
              </div>
              <button
                className="px-4 py-2 text-white rounded-lg bg-[#0082C4] hover:bg-[#006a9e] transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg">Segurança</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-zinc-600" />
                  <div>
                    <p className="font-medium">Alterar Senha</p>
                    <p className="text-sm text-zinc-600">Última alteração há 45 dias</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors">
                  Alterar
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-zinc-600">Adicione uma camada extra de segurança</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009339]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-zinc-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg">Notificações</h3>
            </div>

            <div className="space-y-4">
              {[
                { label: "Alertas de Sistema", description: "Receber notificações sobre eventos importantes" },
                { label: "Atualizações de Dados", description: "Notificar quando novos dados forem importados" },
                { label: "Relatórios Semanais", description: "Resumo semanal por email" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-zinc-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009339]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
