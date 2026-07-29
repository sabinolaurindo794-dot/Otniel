import React, { useEffect, useState } from "react";
import { Shield, Lock, EyeOff, AlertTriangle, KeyRound } from "lucide-react";
import { UserProfile } from "../types";

interface SecurityShieldProps {
  currentUser?: UserProfile | null;
  children: React.ReactNode;
}

export const SecurityShield: React.FC<SecurityShieldProps> = ({ currentUser, children }) => {
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isDevToolsDetected, setIsDevToolsDetected] = useState(false);

  // Check if current user is owner (Sabino Laurindo)
  const isOwner =
    currentUser?.email?.toLowerCase() === "sabinolaurindo794@gmail.com" ||
    currentUser?.email?.toLowerCase() === "admin@lauoil.ao" ||
    currentUser?.email?.toLowerCase().includes("sabino") ||
    currentUser?.role?.toLowerCase() === "owner" ||
    currentUser?.role?.toLowerCase() === "admin";

  useEffect(() => {
    // If user is owner, allow developer tools / inspect for maintenance
    if (isOwner) {
      return;
    }

    // 1. Prevent Right Click (Context Menu) for Non-Owners
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityNotice("🔒 Inspeção e Menu de Contexto bloqueados. Código fonte restrito ao Proprietário (Sabino Laurindo).");
      setTimeout(() => setSecurityNotice(null), 4000);
    };

    // 2. Prevent Keyboard Shortcuts used for Inspect / DevTools / View Source
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        setSecurityNotice("🛡️ Tecla F12 (DevTools) desativada por política de segurança lauOIL.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      if (ctrlOrCmd && (e.shiftKey || e.altKey) && (e.key === "I" || e.key === "i" || e.key === "I")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Atalhos de Inspeção desativados para utilizadores não autorizados.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (ctrlOrCmd && (e.shiftKey || e.altKey) && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Acesso à consola de JavaScript restrito ao proprietário.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
      if (ctrlOrCmd && (e.shiftKey || e.altKey) && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Inspeção de elementos HTML/CSS bloqueada.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      // Ctrl+U / Cmd+U (View Source)
      if (ctrlOrCmd && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Visualização de Código Fonte HTML bloqueada nesta aplicação.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (ctrlOrCmd && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        setSecurityNotice("🛡️ Cópia de código e ficheiros locais bloqueada.");
        setTimeout(() => setSecurityNotice(null), 4000);
        return;
      }
    };

    // 3. Simple DevTools detection via window size threshold anomaly
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

  return (
    <div className="relative min-h-screen">
      {/* Main App Content */}
      <div className={!isOwner ? "select-none" : ""}>{children}</div>

      {/* Security Toast Notification */}
      {securityNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900/95 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-md text-amber-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <span>{securityNotice}</span>
        </div>
      )}

      {/* DevTools Warning Shield overlay if non-owner opens DevTools */}
      {!isOwner && isDevToolsDetected && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito ao Código Fonte</h2>
          <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
            A inspeção de código e engenharia reversa desta aplicação estão protegidas por política de segurança de dados lauOIL. Apenas o administrador titular (<span className="text-amber-400 font-semibold">sabinolaurindo794@gmail.com</span>) tem acesso concedido.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Inicie sessão como Proprietário para desbloquear as ferramentas de desenvolvimento.</span>
          </div>
        </div>
      )}
    </div>
  );
};
