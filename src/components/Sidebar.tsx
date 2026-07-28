import React, { useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  FolderPlus,
  Folder,
  Settings,
  Pin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Code2,
  BookOpen,
} from "lucide-react";
import { Conversation, Project } from "../types";
import { UserProfile } from "./AuthModal";
import { LogIn, ShieldCheck, User } from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePinConversation: (id: string) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  activeArtifactCount: number;
  onOpenArtifactsLibrary: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onTogglePinConversation,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettings,
  isOpen,
  onToggleSidebar,
  theme,
  onToggleTheme,
  activeArtifactCount,
  onOpenArtifactsLibrary,
  currentUser,
  onOpenAuthModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "projects">("chats");

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const recentConversations = filteredConversations.filter((c) => !c.isPinned);

  if (!isOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 w-16 transition-all duration-200">
        <button
          onClick={onToggleSidebar}
          title="Expand sidebar"
          className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onNewChat}
          title="New Chat"
          className="mt-4 p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="mt-auto flex flex-col items-center gap-3">
          <button
            onClick={onOpenArtifactsLibrary}
            title="Artifacts Library"
            className="relative p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            <Code2 className="w-5 h-5" />
            {activeArtifactCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeArtifactCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop overlay for mobile & tablet screens */}
      <div
        onClick={onToggleSidebar}
        className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-30"
      />
      <aside className="fixed md:relative inset-y-0 left-0 z-40 w-72 flex flex-col h-full bg-stone-50 dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 transition-all duration-200 select-none shadow-2xl md:shadow-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-sm font-sans text-xs font-extrabold tracking-tighter">
            Otn
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-stone-900 dark:text-stone-100 leading-none">
              Otniel Studio
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Oil AI Analytics Platform
            </span>
          </div>
        </div>

        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Tab Navigation: Chats / Projects */}
        <div className="grid grid-cols-2 p-1 bg-stone-200/60 dark:bg-stone-900/80 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("chats")}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === "chats"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === "projects"
                ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab === "chats" && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-stone-200/50 dark:bg-stone-900/60 border border-transparent focus:border-amber-600/50 focus:outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400"
            />
          </div>
        </div>
      )}

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {activeTab === "chats" ? (
          <>
            {/* Pinned Chats */}
            {pinnedConversations.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                  <Pin className="w-3 h-3 text-amber-600" />
                  <span>Pinned</span>
                </div>
                <div className="space-y-0.5 mt-1">
                  {pinnedConversations.map((conv) => (
                    <ConversationRow
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={() => onSelectConversation(conv.id)}
                      onDelete={() => onDeleteConversation(conv.id)}
                      onTogglePin={() => onTogglePinConversation(conv.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Chats */}
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Recent Chats
              </div>
              {recentConversations.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-stone-400">
                  No conversations yet. Start a new chat above!
                </div>
              ) : (
                <div className="space-y-0.5 mt-1">
                  {recentConversations.map((conv) => (
                    <ConversationRow
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={() => onSelectConversation(conv.id)}
                      onDelete={() => onDeleteConversation(conv.id)}
                      onTogglePin={() => onTogglePinConversation(conv.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Projects Tab */
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Workspaces
              </span>
              <button
                onClick={onOpenNewProjectModal}
                className="text-xs text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 font-medium flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* All conversations option */}
            <button
              onClick={() => onSelectProject(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition ${
                activeProjectId === null
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>General Workspace</span>
            </button>

            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${
                  activeProjectId === proj.id
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium border border-amber-500/30"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-900/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color || "#d97706" }}
                  />
                  <span className="truncate">{proj.title}</span>
                </div>
                <span className="text-[10px] text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                  {proj.documents?.length || 0} docs
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Artifacts & Footer Section */}
      <div className="p-3 border-t border-stone-200/60 dark:border-stone-800/60 space-y-2 bg-stone-100/50 dark:bg-stone-950/80">
        
        {/* User Account Login Card */}
        <button
          onClick={onOpenAuthModal}
          className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-left transition flex items-center justify-between group"
        >
          {currentUser ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono truncate">
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <LogIn className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Entrar / Login
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  Acesso com Email e Senha
                </div>
              </div>
            </div>
          )}
        </button>

        <button
          onClick={onOpenArtifactsLibrary}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-stone-200/50 dark:bg-stone-900/80 hover:bg-stone-200 dark:hover:bg-stone-900 transition text-stone-700 dark:text-stone-300"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>Artifact Canvas</span>
          </div>
          {activeArtifactCount > 0 && (
            <span className="bg-amber-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {activeArtifactCount}
            </span>
          )}
        </button>

        {/* Theme Preference (Branco vs Preto) Selector */}
        <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400">
            <span>Preferência de Cores:</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono text-[10px]">
              {theme === "dark" ? "Modo Preto" : "Modo Branco"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-stone-200/80 dark:bg-stone-900 border border-stone-300/60 dark:border-stone-800">
            <button
              onClick={() => theme === "dark" && onToggleTheme()}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                theme === "light"
                  ? "bg-white text-stone-900 shadow-sm border border-stone-300"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Branco (Claro)</span>
            </button>

            <button
              onClick={() => theme === "light" && onToggleTheme()}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                theme === "dark"
                  ? "bg-stone-800 text-stone-100 shadow-sm border border-stone-700"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Preto (Escuro)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-900 transition border border-stone-200 dark:border-stone-800"
            title="Configurações do Workspace"
          >
            <Settings className="w-4 h-4 text-amber-600" />
            <span>Configurações do Workspace</span>
          </button>
        </div>
      </div>
    </aside>
  </>
  );
};

interface ConversationRowProps {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const ConversationRow: React.FC<ConversationRowProps> = ({
  conv,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
        isActive
          ? "bg-amber-500/15 text-stone-900 dark:text-stone-100 font-medium"
          : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900/50 hover:text-stone-900 dark:hover:text-stone-200"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-12">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-stone-400 group-hover:text-amber-600" />
        <span className="truncate">{conv.title}</span>
      </div>

      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-stone-100 dark:bg-stone-900 px-1 py-0.5 rounded shadow-xs transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 hover:text-amber-600 transition ${
            conv.isPinned ? "text-amber-600" : "text-stone-400"
          }`}
          title={conv.isPinned ? "Unpin chat" : "Pin chat"}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-stone-400 hover:text-red-500 transition"
          title="Delete chat"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
