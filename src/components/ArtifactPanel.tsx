import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  RotateCw,
  FileCode,
  Sparkles,
} from "lucide-react";
import { Artifact } from "../types";

interface ArtifactPanelProps {
  artifacts: Artifact[];
  activeArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
  onClose: () => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifacts,
  activeArtifactId,
  onSelectArtifact,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const activeArtifact =
    artifacts.find((a) => a.id === activeArtifactId) || artifacts[artifacts.length - 1];

  useEffect(() => {
    if (activeArtifact && viewMode === "preview" && iframeRef.current) {
      updateIframeContent();
    }
  }, [activeArtifact, viewMode]);

  const updateIframeContent = () => {
    if (!iframeRef.current || !activeArtifact) return;

    let htmlContent = activeArtifact.code;

    if (activeArtifact.language === "svg") {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0f172a; }
              svg { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            ${activeArtifact.code}
          </body>
        </html>
      `;
    } else if (activeArtifact.language !== "html") {
      // Wrap generic code or React component snippet in html container with Tailwind CDN for live rendering!
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; background-color: #0c0a09; color: #f5f5f4; }
            </style>
          </head>
          <body>
            <div id="root">
              <pre style="white-space: pre-wrap; font-family: monospace; font-size: 13px;">${escapeHtml(
                activeArtifact.code
              )}</pre>
            </div>
          </body>
        </html>
      `;
    }

    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  };

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleCopy = () => {
    if (!activeArtifact) return;
    navigator.clipboard.writeText(activeArtifact.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeArtifact) return;
    const blob = new Blob([activeArtifact.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext =
      activeArtifact.language === "html"
        ? "html"
        : activeArtifact.language === "svg"
        ? "svg"
        : activeArtifact.language === "tsx"
        ? "tsx"
        : "txt";
    a.download = `${activeArtifact.title.replace(/\s+/g, "_").toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeArtifact) {
    return (
      <div className="w-full md:w-[480px] lg:w-[600px] border-l border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-12 h-12 text-amber-600/40 mb-3" />
        <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
          No Artifact Selected
        </h3>
        <p className="text-xs text-stone-500 max-w-xs mt-1">
          Code snippets, HTML previews, or documents generated in chat will appear here as live interactive artifacts.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300"
        >
          Close Panel
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-stone-900 border-l border-stone-800 text-stone-100 transition-all duration-200 z-30 ${
        isFullscreen
          ? "fixed inset-0 w-full h-full"
          : "w-full md:w-[500px] lg:w-[650px] h-full"
      }`}
    >
      {/* Header bar */}
      <div className="p-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-500">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-stone-100 truncate">
              {activeArtifact.title}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {activeArtifact.language.toUpperCase()} • {activeArtifact.createdAt}
            </span>
          </div>
        </div>

        {/* View Mode Toggle: Preview vs Code */}
        <div className="flex items-center gap-1.5">
          <div className="flex p-1 rounded-xl bg-stone-900 border border-stone-800 text-xs">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === "preview"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <button
              onClick={() => setViewMode("code")}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === "code"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Download Artifact"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition hidden sm:block"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Artifact Version Selector (if multiple artifacts) */}
      {artifacts.length > 1 && (
        <div className="px-3 py-1.5 bg-stone-950/60 border-b border-stone-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider shrink-0 font-semibold">
            History:
          </span>
          {artifacts.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => onSelectArtifact(art.id)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 transition ${
                art.id === activeArtifact.id
                  ? "bg-amber-600/30 text-amber-300 border border-amber-500/40"
                  : "bg-stone-800 text-stone-400 hover:text-stone-200"
              }`}
            >
              #{idx + 1} {art.title}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Viewer */}
      <div className="flex-1 relative bg-stone-950 overflow-hidden">
        {viewMode === "preview" ? (
          <div className="w-full h-full relative">
            <iframe
              ref={iframeRef}
              title="Artifact Live Sandbox"
              className="w-full h-full border-0 bg-stone-950"
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
            <button
              onClick={updateIframeContent}
              className="absolute top-3 right-3 p-2 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-700 shadow-md backdrop-blur-sm transition"
              title="Reload Sandbox"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto p-4 font-mono text-xs leading-relaxed text-stone-200 select-text">
            <pre className="whitespace-pre-wrap">
              <code>{activeArtifact.code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
