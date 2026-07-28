import React, { useState } from "react";
import { X, FolderPlus, FileText, Trash2, Upload, Sparkles } from "lucide-react";
import { Project } from "../types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
}

const COLOR_OPTIONS = [
  "#d97706", // Amber
  "#ea580c", // Orange
  "#2563eb", // Blue
  "#059669", // Emerald
  "#7c3aed", // Violet
  "#db2777", // Pink
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [customInstructions, setCustomInstructions] = useState("");
  const [documents, setDocuments] = useState<{ id: string; name: string; content: string }[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveProject({
      title: title.trim(),
      description: description.trim(),
      color,
      customInstructions: customInstructions.trim(),
      documents,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCustomInstructions("");
    setDocuments([]);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDocuments((prev) => [
          ...prev,
          {
            id: `doc-${Date.now()}-${Math.random()}`,
            name: file.name,
            content: (reader.result as string) || "",
          },
        ]);
      };
      reader.readAsText(file);
    });
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Create Project Workspace
              </h2>
              <p className="text-xs text-stone-500">
                Custom instructions and reference files for Claude
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js SaaS Platform, Research Assistant..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-amber-600 focus:outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Brief summary of what this project is for..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-amber-600 focus:outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-offset-2 ring-amber-600" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Custom System Instructions */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
              <span>Project System Instructions</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 'Always write TypeScript code using Tailwind CSS. Keep answers concise and cite references when available.'"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-amber-600 focus:outline-none text-stone-900 dark:text-stone-100 placeholder-stone-400 leading-relaxed"
            />
          </div>

          {/* Reference Documents */}
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Project Context Documents
            </label>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate font-medium text-stone-800 dark:text-stone-200">
                      {doc.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(doc.id)}
                    className="p-1 text-stone-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-600 cursor-pointer transition text-stone-500 dark:text-stone-400">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>Upload TXT, MD, Code files to project memory</span>
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.js,.ts,.tsx,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition shadow-sm"
            >
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
