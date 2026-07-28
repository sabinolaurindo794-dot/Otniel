import { ModelOption, StarterPrompt } from "../types";

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    name: "Claude 3.5 Sonnet",
    tagline: "Most intelligent & versatile model for complex tasks",
    badge: "Recommended",
    icon: "Sparkles",
    description: "Ideal for coding, deep reasoning, nuanced writing, and artifact rendering.",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Claude 3.5 Opus",
    tagline: "Maximum depth & comprehensive reasoning",
    badge: "Deep Thinker",
    icon: "Brain",
    description: "Best for multi-step logic, architectural design, complex math, and comprehensive documentation.",
  },
  {
    id: "gemini-3.1-flash-lite-image",
    name: "Claude 3.5 Haiku + Multimodal",
    tagline: "Lightning fast speed & image understanding",
    badge: "Fast & Vision",
    icon: "Zap",
    description: "Sub-second speed for quick questions, formatting, diagram analysis, and image generation.",
  },
];

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "p1",
    category: "Coding",
    title: "Build a React Dashboard",
    description: "Create an interactive analytics dashboard with dark theme and live chart controls.",
    prompt: "Build an interactive single-page React dashboard component using Tailwind CSS. Include metric cards, filter controls, a data table, and smooth animation states.",
    iconName: "LayoutDashboard",
    suggestedModel: "gemini-3.6-flash",
  },
  {
    id: "p2",
    category: "Coding",
    title: "Generate SVG Artwork",
    description: "Design a clean vector illustration or geometric tech background.",
    prompt: "Create a sophisticated, beautifully designed SVG illustration of a modern futuristic workspace with glowing neon accent lines on a dark background. Return raw complete SVG code.",
    iconName: "Palette",
    suggestedModel: "gemini-3.6-flash",
  },
  {
    id: "p3",
    category: "Analysis",
    title: "Code Architecture & Review",
    description: "Analyze code quality, performance bottlenecks, and security practices.",
    prompt: "Analyze best practices for state management, server-side caching, and error boundary handling in high-throughput full-stack TypeScript applications. Provide concrete code examples.",
    iconName: "Code",
    suggestedModel: "gemini-3.1-pro-preview",
  },
  {
    id: "p4",
    category: "Writing",
    title: "Technical Spec & Docs",
    description: "Draft a comprehensive API documentation or product specification document.",
    prompt: "Write a complete, structured technical specification document for a real-time collaborative workspace platform. Include architecture overview, data schema, security, and API endpoints.",
    iconName: "FileText",
    suggestedModel: "gemini-3.6-flash",
  },
  {
    id: "p5",
    category: "Creativity",
    title: "Interactive Game / Widget",
    description: "Create a playable mini-game or interactive simulation widget in HTML/JS.",
    prompt: "Create a fully functional interactive mini-game (e.g. a minimalist particle physics canvas simulation or puzzle game) with beautiful minimalist visual styling and clean user controls.",
    iconName: "Gamepad2",
    suggestedModel: "gemini-3.6-flash",
  },
];
