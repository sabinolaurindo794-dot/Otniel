export type ModelId = "gemini-3.6-flash" | "gemini-3.1-pro-preview" | "gemini-3.1-flash-lite-image";

export interface ModelOption {
  id: ModelId;
  name: string;
  tagline: string;
  badge?: string;
  icon: string;
  description: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "file" | "pdf";
  mimeType: string;
  data: string; // Base64 or plain text content
  size?: number;
}

export interface Artifact {
  id: string;
  title: string;
  language: "html" | "tsx" | "typescript" | "javascript" | "markdown" | "json" | "css" | "svg" | "plaintext";
  code: string;
  type: "code" | "preview" | "document" | "svg";
  createdAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  artifacts?: Artifact[];
  thinkingTime?: number;
  modelUsed?: ModelId;
  isStreaming?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  customInstructions: string;
  documents: { id: string; name: string; content: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  projectId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  model: ModelId;
  isPinned?: boolean;
}

export interface StarterPrompt {
  id: string;
  category: "Coding" | "Writing" | "Analysis" | "Creativity";
  title: string;
  description: string;
  prompt: string;
  iconName: string;
  suggestedModel?: ModelId;
}
