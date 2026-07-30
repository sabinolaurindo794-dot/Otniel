import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { MessageItem } from "./components/MessageItem";
import { MessageInput } from "./components/MessageInput";
import { ArtifactPanel } from "./components/ArtifactPanel";
import { ProjectModal } from "./components/ProjectModal";
import { SettingsModal } from "./components/SettingsModal";
import { AuthModal, UserProfile } from "./components/AuthModal";
import { Artifact, Attachment, Conversation, Message, ModelId, Project } from "./types";
import { STARTER_PROMPTS } from "./data/promptPresets";
import { parseArtifactsFromMarkdown } from "./utils/artifactParser";
import { SecurityShield } from "./components/SecurityShield";
import { OIetroDashboard } from "./components/OIetroDashboard";
import { AIInterviewSimulator } from "./components/AIInterviewSimulator";
import {
  Sparkles,
  Code2,
  ArrowRight,
  AlertCircle,
  X,
  Loader2,
  Folder,
  Settings as SettingsIcon,
  MessageSquare,
  BarChart2,
  Bot,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";

import { Language, SUPPORTED_LANGUAGES } from "./data/translations";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("lauoil_language");
      if (saved && ["pt", "en", "ru", "fr", "zh"].includes(saved)) {
        return saved as Language;
      }
    } catch (e) {}
    return "pt";
  });

  useEffect(() => {
    localStorage.setItem("lauoil_language", currentLanguage);
  }, [currentLanguage]);

  // Persistence state in localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem("claude_conversations");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
    return [
      {
        id: "default-conv-1",
        title: "Welcome to OIetro Studio",
        messages: [
          {
            id: "msg-welcome",
            role: "assistant",
            content:
              "Welcome to **OIetro**, your AI oil market analytics and development workspace.\n\nI can help you build applications, analyze energy market trends, forecast crude prices, draft technical documentation, and write code. Any code or documents generated during our chat will open automatically in the **Artifact Canvas** on the right.\n\nHow can I help you today?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            modelUsed: "gemini-3.6-flash",
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model: "gemini-3.6-flash",
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    () => conversations[0]?.id || null
  );

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("claude_projects");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load projects", e);
    }
    return [
      {
        id: "proj-web-dev",
        title: "Full-Stack Web Dev",
        description: "React, Express, Tailwind CSS, and TypeScript development",
        color: "#d97706",
        customInstructions:
          "Write modern, type-safe TypeScript code with Tailwind CSS utilities and clean modular architecture.",
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-3.6-flash");
  const [mainView, setMainView] = useState<"dashboard" | "chat" | "interview">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState(false);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("otniel_theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {}
    return "dark";
  });
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("otniel_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: "usr-admin-default",
      name: "Eng. Sabino Laurindo",
      email: "sabino@lauoil.ao",
      role: "Administrador & Analista de Reservatórios",
      company: "lauOIL Energy & Sonangol",
    };
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("otniel_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("otniel_user");
    }
  }, [currentUser]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("claude_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("claude_projects", JSON.stringify(projects));
  }, [projects]);

  // Sync theme class & data-mode to document root & body
  useEffect(() => {
    localStorage.setItem("otniel_theme", theme);
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      body.classList.add("dark");
      body.classList.remove("light");
      root.setAttribute("data-mode", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      body.classList.add("light");
      body.classList.remove("dark");
      root.setAttribute("data-mode", "light");
      root.style.colorScheme = "light";
    }
  }, [theme]);

  // Scroll to bottom when new messages stream in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isStreaming]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Collect all artifacts in the active conversation
  const currentArtifacts: Artifact[] = (activeConversation?.messages || []).flatMap(
    (m) => m.artifacts || []
  );

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Conversation",
      projectId: activeProjectId || undefined,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model: selectedModel,
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    navigate(`/c/${newConv.id}`);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      const nextId = remaining[0]?.id || null;
      setActiveConversationId(nextId);
      if (nextId) navigate(`/c/${nextId}`);
      else navigate("/");
    }
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    setApiError(null);
    let currentConvId = activeConversationId;

    // Create a new conversation if none active
    if (!currentConvId || !activeConversation) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        title: text.slice(0, 30) || "New Conversation",
        projectId: activeProjectId || undefined,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        model: selectedModel,
      };
      setConversations((prev) => [newConv, ...prev]);
      currentConvId = newConv.id;
      setActiveConversationId(newConv.id);
      navigate(`/c/${newConv.id}`);
    }

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments,
    };

    const assistantMessageId = `msg-asst-${Date.now()}`;
    const placeholderAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: selectedModel,
      isStreaming: true,
      thinkingTime: 1,
    };

    // Update conversation state with User + Placeholder Assistant message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConvId) {
          const updatedMessages = [...c.messages, userMessage, placeholderAssistantMessage];
          const newTitle = c.messages.length === 0 ? text.slice(0, 36) || "New Conversation" : c.title;
          return {
            ...c,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      // Gather project context
      let systemInstruction = activeProject?.customInstructions || "";
      if (activeProject?.documents && activeProject.documents.length > 0) {
        systemInstruction +=
          "\n\nReference Project Documents:\n" +
          activeProject.documents.map((d) => `--- ${d.name} ---\n${d.content}`).join("\n\n");
      }

      // Format prior history for Gemini endpoint
      const currentMessages = activeConversation?.messages || [];
      const formattedHistory = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const imagesPayload = attachments
        .filter((a) => a.type === "image")
        .map((a) => ({
          mimeType: a.mimeType,
          data: a.data,
        }));

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          history: formattedHistory,
          systemInstruction,
          model: selectedModel,
          images: imagesPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}: Failed to stream AI response`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunkStr = decoder.decode(value, { stream: true });
            const lines = chunkStr.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const json = JSON.parse(line.replace("data: ", ""));
                  if (json.chunk) {
                    accumulatedText += json.chunk;

                    // Update streaming message in real time
                    setConversations((prev) =>
                      prev.map((c) => {
                        if (c.id === currentConvId) {
                          const msgs = c.messages.map((m) => {
                            if (m.id === assistantMessageId) {
                              return { ...m, content: accumulatedText };
                            }
                            return m;
                          });
                          return { ...c, messages: msgs };
                        }
                        return c;
                      })
                    );
                  }
                  if (json.error) {
                    setApiError(json.error);
                    accumulatedText += `\n\n*Error:* ${json.error}`;
                  }
                } catch (e) {
                  // ignore JSON parse stream chunks
                }
              }
            }
          }
        }
      }

      // Stream completed: Parse artifacts and update message state
      const { artifacts } = parseArtifactsFromMarkdown(accumulatedText);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === currentConvId) {
            const msgs = c.messages.map((m) => {
              if (m.id === assistantMessageId) {
                return {
                  ...m,
                  content: accumulatedText,
                  artifacts: artifacts.length > 0 ? artifacts : undefined,
                  isStreaming: false,
                };
              }
              return m;
            });
            return { ...c, messages: msgs };
          }
          return c;
        })
      );

      if (artifacts.length > 0) {
        setIsArtifactPanelOpen(true);
        setActiveArtifactId(artifacts[artifacts.length - 1].id);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat streaming error:", err);
        const errMsg = err?.message || "An unexpected error occurred while communicating with the server.";
        setApiError(errMsg);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === currentConvId) {
              const msgs = c.messages.map((m) => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: `⚠️ **API Error:** ${errMsg}\n\nPlease check your configuration in Settings or try again.`,
                    isStreaming: false,
                  };
                }
                return m;
              });
              return { ...c, messages: msgs };
            }
            return c;
          })
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleSaveProject = (projData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProj: Project = {
      ...projData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  const handleOpenArtifact = (art: Artifact) => {
    setIsArtifactPanelOpen(true);
    setActiveArtifactId(art.id);
  };

  const handleExportChat = () => {
    if (!activeConversation) {
      alert("No active conversation to export.");
      return;
    }
    const dataStr = JSON.stringify(activeConversation, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = (activeConversation.title || "conversation")
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/_+/g, "_");
    link.href = url;
    link.download = `${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <SecurityShield
      currentUser={currentUser}
      isAppLocked={isAppLocked}
      onUnlockApp={() => setIsAppLocked(false)}
      onOpenAuthModal={() => setIsAuthModalOpen(true)}
      onLoginSuccess={(user) => {
        setCurrentUser(user);
        setIsAppLocked(false);
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden bg-stone-100 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          navigate(`/c/${id}`);
        }}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onTogglePinConversation={handleTogglePin}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        activeArtifactCount={currentArtifacts.length}
        onOpenArtifactsLibrary={() => setIsArtifactPanelOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content View with React Router */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-stone-950">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          selectedModel={selectedModel}
          onSelectModel={(m) => setSelectedModel(m)}
          currentTitle={activeConversation?.title || "New Chat"}
          activeProject={activeProject || null}
          onToggleArtifactPanel={() => setIsArtifactPanelOpen(!isArtifactPanelOpen)}
          isArtifactPanelOpen={isArtifactPanelOpen}
          artifactCount={currentArtifacts.length}
          onShareChat={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Workspace URL copied to clipboard!");
          }}
          onExportChat={handleExportChat}
          currentLanguage={currentLanguage}
          onSelectLanguage={(lang) => setCurrentLanguage(lang)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLockApp={() => setIsAppLocked(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />

        {/* Workspace Mode Switcher Header */}
        <div className="px-4 py-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setMainView("dashboard")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                mainView === "dashboard"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Painel de Mercado Otniel</span>
            </button>

            <button
              onClick={() => setMainView("interview")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                mainView === "interview"
                  ? "bg-amber-600 text-white shadow-xs font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulador de Entrevista IA</span>
            </button>

            <button
              onClick={() => setMainView("chat")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
                mainView === "chat"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistente AI</span>
            </button>
          </div>

          {/* Quick Theme Switcher Pill (Branco / Preto) */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center gap-1.5 shadow-xs hover:border-amber-500 transition"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Modo Branco (Claro)</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                <span>Modo Preto (Escuro)</span>
              </>
            )}
          </button>
        </div>

        {/* Global API Error Banner */}
        {apiError && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="p-1 hover:text-red-900 dark:hover:text-red-200 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body: lauOIL Dashboard, AI Interview Simulator, or AI Chat Workspace */}
        {mainView === "dashboard" ? (
          <div className="flex-1 overflow-y-auto">
            <OIetroDashboard
              onAskAI={(prompt) => {
                setMainView("chat");
                handleSendMessage(prompt);
              }}
              currentLanguage={currentLanguage}
              onSelectLanguage={(lang) => setCurrentLanguage(lang)}
              currentUser={currentUser}
            />
          </div>
        ) : mainView === "interview" ? (
          <div className="flex-1 overflow-y-auto">
            <AIInterviewSimulator
              currentLanguage={currentLanguage}
              onAskAI={(prompt) => {
                setMainView("chat");
                handleSendMessage(prompt);
              }}
              currentUser={currentUser}
            />
          </div>
        ) : (
          <>
            {/* Chat Message Scroll Area */}
            <div className="flex-1 overflow-y-auto">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                /* Welcome / Empty State View */
                <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-lg font-sans text-xl font-black tracking-tight">
                    lau
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                      lauOIL AI Assistant
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                      Como posso ajudar na análise do mercado petrolífero, modelos preditivos ou desenvolvimento de software hoje?
                    </p>
                  </div>

                  {/* Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-4">
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSendMessage(p.prompt)}
                        className="group p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-900 hover:border-amber-600/50 transition-all text-xs space-y-1.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition flex items-center gap-1.5">
                            {p.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                          {p.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Active Message List */
                <div className="divide-y divide-stone-100 dark:divide-stone-900/60 pb-8">
                  {activeConversation.messages.map((msg, idx) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      isLast={idx === activeConversation.messages.length - 1}
                      onRegenerate={() => {
                        const lastUserMsg = activeConversation.messages
                          .slice(0, idx)
                          .reverse()
                          .find((m) => m.role === "user");
                        if (lastUserMsg) {
                          handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
                        }
                      }}
                      onOpenArtifact={handleOpenArtifact}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Floating Input Box */}
            <MessageInput
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
              activeProjectName={activeProject?.title}
            />
          </>
        )}
      </div>

      {/* Side Artifact Canvas Panel */}
      {isArtifactPanelOpen && (
        <ArtifactPanel
          artifacts={currentArtifacts}
          activeArtifactId={activeArtifactId}
          onSelectArtifact={(id) => setActiveArtifactId(id)}
          onClose={() => setIsArtifactPanelOpen(false)}
        />
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSaveProject={handleSaveProject}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onClearHistory={() => {
          setConversations([]);
          setActiveConversationId(null);
          navigate("/");
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
      />
    </div>
    </SecurityShield>
  );
}

