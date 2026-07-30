import React from "react";
import { X, Settings, Sun, Moon } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onClearHistory?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
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
              Preferências de Cores
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content - ONLY Theme / Color Preferences */}
        <div className="p-4 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3">
            <div>
              <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                Preferência de Cores do Tema
              </span>
              <span className="text-stone-500 text-[11px]">
                Escolha o modo visual do workspace: tema claro (Branco) ou tema escuro (Preto).
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Modo Branco / Claro */}
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

              {/* Modo Preto / Escuro */}
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
        </div>
      </div>
    </div>
  );
};
