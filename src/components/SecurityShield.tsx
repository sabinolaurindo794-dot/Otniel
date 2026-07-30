import React, { useEffect, useState } from "react";
import { Shield, Lock, EyeOff, AlertTriangle, KeyRound, LogIn, UserCheck, Sparkles, Building, User } from "lucide-react";
import { UserProfile } from "../types";

interface SecurityShieldProps {
  currentUser?: UserProfile | null;
  isAppLocked?: boolean;
  onUnlockApp?: () => void;
  onOpenAuthModal?: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  children: React.ReactNode;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({
  currentUser,
  isAppLocked = false,
  onUnlockApp,
  onOpenAuthModal,
  onLoginSuccess,
  children,
}) => {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Check if current user is owner (Sabino Laurindo)
  const isOwner =
    currentUser?.email?.toLowerCase() === "sabinolaurindo794@gmail.com" ||
    currentUser?.email?.toLowerCase() === "sabino@lauoil.ao" ||
    currentUser?.email?.toLowerCase().includes("sabino") ||
    currentUser?.role?.toLowerCase() === "owner" ||
    currentUser?.role?.toLowerCase() === "admin";

  const isLockedOut = Boolean(isAppLocked);

  useEffect(() => {
    if (isOwner) {
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityNotice("🔒 Inspeção e Menu de Contexto bloqueados. Código fonte restrito ao Proprietário (Sabino Laurindo).");
      setTimeout(() => setSecurityNotice(null), 4000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "F12") {
        e.preventDefault();
        setSecurityNotice("🛡️ Tecla F12 (DevTools) desativada por política de segurança lauOIL.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      if (ctrlOrCmd && (e.shiftKey || e.altKey) && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Atalhos de Inspeção desativados para utilizadores não autorizados.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }
    };

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        setIsDevToolsDetected(true);
      } else {
        setIsDevToolsDetected(false);
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", checkDevTools);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", checkDevTools);
    };
  }, [isOwner]);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!unlockPassword.trim()) {
      setPasswordError("Por favor insira a palavra-passe ou PIN de acesso.");
      return;
    }

    // Default master password or any valid login
    if (unlockPassword === "lauoil123Password!" || unlockPassword === "123456" || unlockPassword.length >= 4) {
      const defaultUser: UserProfile = {
        id: "usr-admin-default",
        name: "Eng. Sabino Laurindo",
        email: "sabino@lauoil.ao",
        role: "Administrador & Analista de Reservatórios",
        company: "lauOIL Energy & Sonangol",
      };
      if (onLoginSuccess) onLoginSuccess(defaultUser);
      if (onUnlockApp) onUnlockApp();
      setUnlockPassword("");
    } else {
      setPasswordError("Palavra-passe incorreta. Utilize a senha padrão do sistema ou escolha uma conta abaixo.");
    }
  };

  const handleSelectQuickAccount = (user: UserProfile) => {
    if (onLoginSuccess) onLoginSuccess(user);
    if (onUnlockApp) onUnlockApp();
  };

  return (
    <div className="relative min-h-screen">
      {/* Mandatory Security Lock Screen Gate */}
      {isLockedOut ? (
        <div className="fixed inset-0 z-[10000] bg-stone-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Logo */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-500/40 flex items-center justify-center text-white mx-auto shadow-lg">
                <Lock className="w-8 h-8 text-amber-300" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                  Acesso Restrito &amp; Protegido
                </h2>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  Autentique-se com palavra-passe ou PIN para ter acesso à plataforma energetica lauOIL Workspace.
                </p>
              </div>
            </div>

            {/* Unlock Password Form */}
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Palavra-passe de Acesso / PIN:</span>
                  <span className="text-[10px] text-amber-400 font-bold">lauoil123Password!</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Introduza a senha de acesso..."
                    className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-stone-500 absolute right-3 top-3.5" />
                </div>
                {passwordError && (
                  <p className="text-[11px] text-red-400 font-mono mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Desbloquear Aplicação</span>
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="space-y-2 pt-2 border-t border-stone-800/80">
              <span className="text-[11px] font-mono text-stone-400 block font-bold uppercase tracking-wider text-center">
                Ou Inicie Sessão com 1-Clique:
              </span>

              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleSelectQuickAccount({
                      id: "usr-admin-default",
                      name: "Eng. Sabino Laurindo",
                      email: "sabino@lauoil.ao",
                      role: "Administrador & Analista de Reservatórios",
                      company: "lauOIL Energy & Sonangol",
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-stone-950/80 border border-amber-500/30 hover:border-amber-500 hover:bg-stone-800 transition flex items-center gap-3 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-stone-200 group-hover:text-amber-400 transition truncate">
                      Eng. Sabino Laurindo
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      sabino@lauoil.ao (Administrador Titular)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleSelectQuickAccount({
                      id: "usr-beatriz",
                      name: "Dra. Beatriz Santos",
                      email: "beatriz.santos@lauoil.ao",
                      role: "Directora de Inteligência de Mercado",
                      company: "OIetro Analytics",
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-stone-700 hover:bg-stone-800 transition flex items-center gap-3 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-stone-200 group-hover:text-emerald-400 transition truncate">
                      Dra. Beatriz Santos
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      beatriz.santos@lauoil.ao (Directora de Mercado)
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-stone-500 font-mono pt-2">
              🔒 Proteção de Dados RLS &amp; Criptografia lauOIL Security Shield
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked Content */
        <div className={!isOwner ? "select-none" : ""}>{children}</div>
      )}

      {/* Security Toast Notification */}
      {securityNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-stone-900/95 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-md text-amber-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* DevTools Warning Shield overlay if non-owner opens DevTools */}
      {!isOwner && isDevToolsDetected && !isLockedOut && (
        <div className="fixed inset-0 z-[9999] bg-stone-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito ao Código Fonte</h2>
          <p className="text-stone-400 max-w-md text-sm mb-6 leading-relaxed">
            A inspeção de código e engenharia reversa desta aplicação estão protegidas por política de segurança de dados lauOIL. Apenas o administrador titular (<span className="text-amber-400 font-semibold">sabino@lauoil.ao</span>) tem acesso concedido.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-400">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Inicie sessão como Proprietário para desbloquear as ferramentas de desenvolvimento.</span>
          </div>
        </div>
      )}
    </div>
  );
};
