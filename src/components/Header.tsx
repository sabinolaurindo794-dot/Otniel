import React, { useState } from "react";
import {
  Menu,
  ChevronDown,
  Code2,
  Share2,
  Sparkles,
  Brain,
  Zap,
  Folder,
  Check,
  Download,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { ModelId, Project } from "../types";
import { AVAILABLE_MODELS } from "../data/promptPresets";
import { Language, SUPPORTED_LANGUAGES, translations } from "../data/translations";
import { UserProfile } from "./AuthModal";
import { LogIn, UserCheck, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  currentTitle: string;
  activeProject: Project | null;
  onToggleArtifactPanel: () => void;
  isArtifactPanelOpen: boolean;
  artifactCount: number;
  onShareChat: () => void;
  onExportChat: () => void;
  currentLanguage?: Language;
  onSelectLanguage?: (lang: Language) => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  currentTitle,
  activeProject,
  onToggleArtifactPanel,
  isArtifactPanelOpen,
  artifactCount,
  onShareChat,
  onExportChat,
  currentLanguage = "pt",
  onSelectLanguage,
  currentUser,
  onOpenAuthModal,
  theme = "dark",
  onToggleTheme,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const t = translations[currentLanguage] || translations.pt;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const currentModelObj =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const getModelIcon = (iconName: string) => {
    switch (iconName) {
      case "Brain":
        return <Brain className="w-4 h-4 text-purple-500" />;
      case "Zap":
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 transition shadow-xs"
          >
            {getModelIcon(currentModelObj.icon)}
            <span className="font-semibold">{currentModelObj.name}</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-mono">
              {currentModelObj.badge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {/* Model Options Menu */}
          {isModelDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setIsModelDropdownOpen(false)}
            >
              <div className="px-2 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Select Model Architecture
              </div>
              <div className="space-y-1">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => onSelectModel(model.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-amber-500/10 text-stone-900 dark:text-stone-100 border border-amber-500/30"
                          : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      }`}
                    >
                      <div className="mt-0.5">{getModelIcon(model.icon)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{model.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight mt-0.5">
                          {model.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Project Indicator */}
        {activeProject && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <Folder className="w-3.5 h-3.5" />
            <span className="font-medium max-w-[120px] truncate">{activeProject.title}</span>
          </div>
        )}

        {/* Current Title */}
        <h1 className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate max-w-[200px] sm:max-w-md hidden sm:block border-l border-stone-200 dark:border-stone-800 pl-3">
          {currentTitle || "New Conversation"}
        </h1>
      </div>

      {/* Header Actions & Language Selector */}
      <div className="flex items-center gap-2">
        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 transition shadow-xs"
            title="Escolha de Língua / Language / Язык / Langue / 语言"
          >
            <span className="text-sm leading-none">{currentLangObj.flag}</span>
            <span className="font-semibold hidden sm:inline">{currentLangObj.nativeName}</span>
            <span className="font-mono text-[10px] uppercase text-amber-500 font-bold sm:hidden">{currentLangObj.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
          </button>

          {isLangDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={() => setIsLangDropdownOpen(false)}
            >
              <div className="px-2 py-1 text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800 mb-1 pb-1">
                Idioma / Language
              </div>
              <div className="space-y-0.5">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => onSelectLanguage && onSelectLanguage(lang.code)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30"
                          : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onExportChat}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition flex items-center gap-1.5 text-xs font-medium"
          title={t.export}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t.export}</span>
        </button>

        <button
          onClick={onShareChat}
          className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 transition flex items-center gap-1.5 text-xs font-medium"
          title={t.share}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t.share}</span>
        </button>

        {/* Theme Switcher Button (Branco / Preto) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="px-2.5 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
            title={theme === "dark" ? "Mudar para Modo Branco (Claro)" : "Mudar para Modo Preto (Escuro)"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden lg:inline text-[11px]">Branco (Claro)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-700 shrink-0" />
                <span className="hidden lg:inline text-[11px]">Preto (Escuro)</span>
              </>
            )}
          </button>
        )}

        {/* Artifact Panel Toggle */}
        <button
          onClick={onToggleArtifactPanel}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-xs ${
            isArtifactPanelOpen
              ? "bg-amber-600 text-white shadow-amber-600/20"
              : "bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span className="hidden md:inline">{t.artifact_canvas}</span>
          {artifactCount > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                isArtifactPanelOpen
                  ? "bg-amber-800 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {artifactCount}
            </span>
          )}
        </button>

        {/* Login & Password / User Profile Button */}
        <button
          onClick={onOpenAuthModal}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md ${
            currentUser
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white"
          }`}
          title="Login e Acesso com Senha / Autenticação"
        >
          {currentUser ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline truncate max-w-[110px]">{currentUser.name}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Entrar / Login</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

