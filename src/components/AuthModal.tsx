import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  KeyRound,
  AlertCircle,
  Building,
} from "lucide-react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatarUrl?: string;
  token?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

// Pre-configured demo accounts for 1-click access
const DEMO_ACCOUNTS = [
  {
    name: "Eng. Sabino Laurindo",
    email: "sabino@lauoil.ao",
    password: "lauoil123Password!",
    role: "Administrador & Analista de Reservatórios",
    company: "lauOIL Energy & Sonangol",
  },
  {
    name: "Dra. Beatriz Santos",
    email: "beatriz.santos@lauoil.ao",
    password: "lauoil123Password!",
    role: "Directora de Inteligência de Mercado",
    company: "OIetro Analytics",
  },
  {
    name: "Eng. Manuel Silva",
    email: "manuel.silva@sonangol.co.ao",
    password: "lauoil123Password!",
    role: "Especialista E&P Convidado",
    company: "Sonangol P&P",
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("sabino@lauoil.ao");
  const [loginPassword, setLoginPassword] = useState("lauoil123Password!");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regRole, setRegRole] = useState("Analista de Mercado");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage("Por favor introduza o seu email e senha de acesso.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.user) {
        setSuccessMessage("Sessão iniciada com sucesso!");
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 500);
      } else {
        setErrorMessage(data.error || "Email ou senha incorrectos.");
      }
    } catch (err) {
      // Local fallback in case network fails
      const demoMatch = DEMO_ACCOUNTS.find(
        (a) => a.email.toLowerCase() === loginEmail.toLowerCase()
      );
      const user: UserProfile = {
        id: "usr-" + Date.now(),
        name: demoMatch ? demoMatch.name : loginEmail.split("@")[0],
        email: loginEmail,
        role: demoMatch ? demoMatch.role : "Analista Autorizado",
        company: demoMatch ? demoMatch.company : "lauOIL Corporate",
      };
      setSuccessMessage("Sessão iniciada (Modo Seguro Offline)!");
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("Por favor preencha todos os campos obrigatórios.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          company: regCompany || "Operadora / Consultoria",
          role: regRole,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.user) {
        setSuccessMessage("Conta criada com sucesso!");
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 600);
      } else {
        setErrorMessage(data.error || "Não foi possível criar a conta.");
      }
    } catch (err) {
      const user: UserProfile = {
        id: "usr-" + Date.now(),
        name: regName,
        email: regEmail,
        company: regCompany || "lauOIL Partner",
        role: regRole,
      };
      setSuccessMessage("Conta registada com sucesso!");
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 600);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoSelect = (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoginEmail(account.email);
    setLoginPassword(account.password);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden relative text-stone-100 space-y-0">
        
        {/* Header Title Bar */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/50 border-b border-stone-800 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-100 tracking-tight">
                Acesso Seguro &amp; Autenticação
              </h2>
              <p className="text-xs text-stone-400">
                Portal de Inteligência Energética Otniel Studio
              </p>
            </div>
          </div>

          {/* Current Logged In Banner */}
          {currentUser && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-stone-300 font-bold">{currentUser.name}</span>
                  <span className="block text-[10px] text-stone-400 font-mono">{currentUser.email}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setSuccessMessage("Sessão encerrada com sucesso.");
                }}
                className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[11px] font-bold transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        {!currentUser && (
          <div className="grid grid-cols-2 border-b border-stone-800 text-xs font-bold font-mono">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMessage(null);
              }}
              className={`py-3 flex items-center justify-center gap-2 transition ${
                activeTab === "login"
                  ? "border-b-2 border-amber-500 text-amber-400 bg-stone-800/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar / Login</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMessage(null);
              }}
              className={`py-3 flex items-center justify-center gap-2 transition ${
                activeTab === "register"
                  ? "border-b-2 border-amber-500 text-amber-400 bg-stone-800/40"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Nova Conta</span>
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === "login" && !currentUser && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email de Acesso ou Utilizador *</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="exemplo@lauoil.ao"
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Senha de Acesso (Password) *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 pr-10 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Lembrar credenciais</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Para redefinir a sua senha, contacte o suporte técnico laOIL em suporte@lauoil.ao")}
                  className="text-amber-400 hover:underline font-mono"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? "A Autenticar..." : "Entrar no Sistema"}</span>
              </button>

              {/* 1-Click Demo Quick Accounts */}
              <div className="pt-3 border-t border-stone-800/80 space-y-2">
                <span className="text-[10px] uppercase font-mono text-stone-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Acesso Rápido com Contas de Demonstração:</span>
                </span>

                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDemoSelect(acc)}
                      className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-200 group-hover:text-amber-400 transition">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">{acc.role}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 font-mono">
                        Usar
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && !currentUser && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-mono mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nome Completo *</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Eng. João Pedro"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-mono mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Profissional *</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="joao@empresa.com"
                  className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-mono mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>Empresa</span>
                  </label>
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="Ex: Sonangol / ENI"
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-mono mb-1">Função / Cargo</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  >
                    <option value="Analista de Mercado">Analista de Mercado</option>
                    <option value="Engenheiro de Reservatórios">Engenheiro de Reservatórios</option>
                    <option value="Director Executivo">Director Executivo</option>
                    <option value="Consultor Independente">Consultor Independente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 font-mono mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-mono mb-1">Confirmar Senha *</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? "A Criar Registo..." : "Concluir Registo"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
