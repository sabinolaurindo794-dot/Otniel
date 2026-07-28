import React, { useRef, useState } from "react";
import {
  ArrowUp,
  Paperclip,
  Image as ImageIcon,
  X,
  Square,
  Sparkles,
  FileText,
} from "lucide-react";
import { Attachment } from "../types";

interface MessageInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  activeProjectName?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  activeProjectName,
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(text.trim(), attachments);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (isImage || isPdf) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const newAtt: Attachment = {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: isPdf ? "pdf" : "image",
            mimeType: file.type || (isPdf ? "application/pdf" : "image/png"),
            data: reader.result as string,
            size: file.size,
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
      } else {
        reader.readAsText(file);
        reader.onload = () => {
          const newAtt: Attachment = {
            id: `att-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: "file",
            mimeType: file.type || "text/plain",
            data: reader.result as string,
            size: file.size,
          };
          setAttachments((prev) => [...prev, newAtt]);
        };
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleInputText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto grow textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-stone-950/80 border-t border-stone-200/60 dark:border-stone-800/60">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Project Context Badge */}
        {activeProjectName && (
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 px-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Chatting in workspace: <strong className="text-stone-800 dark:text-stone-200">{activeProjectName}</strong>
            </span>
          </div>
        )}

        {/* Attachment Thumbnails */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 pl-2 pr-7 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                {att.type === "image" ? (
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                ) : att.type === "pdf" ? (
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span className="truncate max-w-[120px]">{att.name}</span>
                {att.type === "pdf" && (
                  <span className="text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-600 dark:text-red-400 px-1 rounded">
                    PDF
                  </span>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute right-1 text-stone-400 hover:text-red-500 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box Container */}
        <div className="relative rounded-2xl border border-stone-300 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-900/90 shadow-sm focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/20 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInputText}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao Otniel AI, envie prompts ou anexe documentos PDF..."
            className="w-full pl-4 pr-12 py-3.5 bg-transparent resize-none text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none min-h-[52px] max-h-[200px]"
          />

          {/* Attach file hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf,application/pdf,.txt,.md,.js,.ts,.tsx,.json,.csv,.html,.css"
            className="hidden"
          />

          {/* Action Toolbar Inside Box */}
          <div className="px-3 pb-2 flex items-center justify-between border-t border-stone-200/40 dark:border-stone-800/40 pt-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
                title="Attach image or text document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() && attachments.length === 0}
                className={`p-2 rounded-xl transition shadow-sm flex items-center justify-center ${
                  text.trim() || attachments.length > 0
                    ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed"
                }`}
                title="Send Prompt"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-stone-400 dark:text-stone-500">
          Claude may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  );
};
