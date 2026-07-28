import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  Code2,
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  RotateCw,
  Sparkles,
  User,
  Eye,
} from "lucide-react";
import { Artifact, Message } from "../types";

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onOpenArtifact: (artifact: Artifact) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  onRegenerate,
  onOpenArtifact,
}) => {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-6 px-4 md:px-8 transition-colors ${
        isUser
          ? "bg-transparent"
          : "bg-stone-50/70 dark:bg-stone-900/40 border-y border-stone-200/50 dark:border-stone-800/50"
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Role Icon */}
        <div className="shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 font-semibold text-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-sm">
              C
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header metadata */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              {isUser ? "You" : "Claude"}
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              {message.timestamp}
            </span>
          </div>

          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 border border-stone-300/50 dark:border-stone-700/50 text-xs font-medium text-stone-700 dark:text-stone-300"
                >
                  {att.type === "image" ? (
                    <img
                      src={att.data}
                      alt={att.name}
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                  ) : (
                    <FileText className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="truncate max-w-[150px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thinking / Reasoning Breakdown */}
          {message.thinkingTime && !isUser && (
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-900/60 overflow-hidden text-xs">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="w-full px-3 py-2 flex items-center justify-between text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-medium">
                    Thought for {message.thinkingTime}s
                  </span>
                </div>
                {showThinking ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showThinking && (
                <div className="p-3 border-t border-stone-200/60 dark:border-stone-800/60 text-stone-600 dark:text-stone-400 font-mono text-[11px] leading-relaxed space-y-1 bg-stone-200/30 dark:bg-stone-950/50">
                  <p>• Analyzed user requirements and context.</p>
                  <p>• Evaluated optimal architecture and visual layout.</p>
                  <p>• Formatted response code and extracted artifact components.</p>
                </div>
              )}
            </div>
          )}

          {/* Body Text / Markdown */}
          <div className="prose dark:prose-invert max-w-none text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && codeString.length > 20) {
                    return (
                      <div className="my-3 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-900 text-stone-100 overflow-hidden shadow-xs">
                        <div className="px-4 py-2 bg-stone-800/80 border-b border-stone-700/60 flex items-center justify-between text-xs font-mono text-stone-400">
                          <span className="uppercase text-[10px] font-bold text-amber-500">
                            {language || "code"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const art: Artifact = {
                                  id: `art-${Date.now()}`,
                                  title: `${language.toUpperCase()} Snippet`,
                                  language: (language as any) || "javascript",
                                  code: codeString,
                                  type: ["html", "svg"].includes(language) ? "preview" : "code",
                                  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                };
                                onOpenArtifact(art);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 transition text-[11px] font-sans font-semibold"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View in Artifact Canvas</span>
                            </button>

                            <button
                              onClick={() => navigator.clipboard.writeText(codeString)}
                              className="p-1 hover:text-stone-200 transition"
                              title="Copy Code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                          <code>{codeString}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-amber-700 dark:text-amber-400 font-mono text-xs"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>

            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-amber-600 animate-pulse" />
            )}
          </div>

          {/* Generated Artifact Badges */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Generated Artifacts
              </span>
              <div className="flex flex-wrap gap-2">
                {message.artifacts.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => onOpenArtifact(art)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium transition shadow-xs"
                  >
                    <Code2 className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold">{art.title}</span>
                    <span className="text-[10px] uppercase bg-amber-600/20 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-300 font-mono">
                      {art.language}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-3 pt-2 text-stone-400">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs hover:text-stone-700 dark:hover:text-stone-200 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 text-xs hover:text-stone-700 dark:hover:text-stone-200 transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
