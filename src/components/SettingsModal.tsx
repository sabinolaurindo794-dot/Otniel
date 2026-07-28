import React from "react";
import { X, Settings, ShieldCheck, Sun, Moon, Trash2, Key, Info } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Workspace Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* API Credentials Info */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  Gemini API Status
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Connected
              </span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-[11px]">
              API calls are securely routed server-side via environment secrets (`GEMINI_API_KEY`). You can view or update your secrets in the <strong>Settings &gt; Secrets</strong> panel.
            </p>
          </div>

          {/* Theme Selection */}
          <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3">
            <div>
              <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                Preferência de Cores do Tema (Branco ou Preto)
              </span>
              <span className="text-stone-500 text-[11px]">
                Escolha a aparência visual do workspace: fundo claro de alta legibilidade ou modo escuro.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* White/Light Mode Card */}
              <button
                type="button"
                onClick={() => theme === "dark" && onToggleTheme()}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                  theme === "light"
                    ? "bg-white border-amber-500 ring-2 ring-amber-500/20 text-stone-900 shadow-md"
                    : "bg-stone-200/50 dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className={`w-4 h-4 ${theme === "light" ? "text-amber-600" : "text-stone-400"}`} />
                  {theme === "light" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs">Modo Branco</div>
                  <div className="text-[10px] opacity-75">Tema Claro / Iluminado</div>
                </div>
              </button>

              {/* Black/Dark Mode Card */}
              <button
                type="button"
                onClick={() => theme === "light" && onToggleTheme()}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-20 ${
                  theme === "dark"
                    ? "bg-stone-950 border-amber-500 ring-2 ring-amber-500/20 text-stone-100 shadow-md"
                    : "bg-stone-200/50 dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className={`w-4 h-4 ${theme === "dark" ? "text-amber-400" : "text-stone-400"}`} />
                  {theme === "dark" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs">Modo Preto</div>
                  <div className="text-[10px] opacity-75">Tema Escuro / Executivo</div>
                </div>
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-700 dark:text-red-400">
                Clear Conversations
              </span>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete all local conversations?")) {
                    onClearHistory();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
            <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
              Permanently removes all saved chat histories and local cached artifacts.
            </p>
          </div>

          {/* Platform Info */}
          <div className="pt-2 flex items-center gap-2 text-stone-400 text-[11px]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>OIetro Studio v1.0.0 • Powered by Gemini 3.6 Flash &amp; 3.1 Pro</span>
          </div>
        </div>
      </div>
    </div>
  );
};
